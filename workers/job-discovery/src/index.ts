import { createClient } from "@supabase/supabase-js";
import { QUERIES, BOARDS_BY_COUNTRY, SCORE_PROMPT } from "./config";

interface Env {
  APIFY_API_TOKEN: string;
  GROQ_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface JobListing {
  title: string;
  company: string;
  company_domain: string;
  location: string;
  country: string;
  city: string;
  url: string;
  source: string;
  raw_description: string;
  posted_date: string;
  salary_min: number | null;
  salary_max: number | null;
  remote_ok: boolean;
}

interface ScoredJob extends JobListing {
  ai_score: number | null;
  ai_score_reasoning: string;
  detected_language: string;
  cv_track: number | null;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 2000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxRetries - 1) throw e;
      await new Promise((r) => setTimeout(r, baseDelay * 2 ** attempt));
    }
  }
  throw new Error("retry exhausted");
}

async function scrapeBoard(
  board: string,
  queries: string[],
  country: string,
  env: Env
): Promise<JobListing[]> {
  const actorId = ACTOR_MAP[board];
  if (!actorId) return [];

  const body = {
    actorId,
    input: {
      queries,
      maxPagesPerQuery: 2,
      proxy: { useApifyProxy: true },
    },
    options: { maxItems: 50 },
  };

  const startRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${env.APIFY_API_TOKEN}`,
    { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }
  );
  if (!startRes.ok) throw new Error(`Apify start failed: ${board} ${startRes.status}`);

  const { data } = (await startRes.json()) as any;
  const runId = data.id;
  const datasetId = data.defaultDatasetId;

  let attempts = 0;
  while (attempts < 20) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${env.APIFY_API_TOKEN}`
    );
    const status = (await statusRes.json()) as any;
    if (status.data.status === "SUCCEEDED") break;
    if (status.data.status === "FAILED") throw new Error(`Apify run failed: ${board}`);
    attempts++;
  }

  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${env.APIFY_API_TOKEN}`
  );
  const items = (await datasetRes.json()) as any[];

  return items.map((item: any) => ({
    title: item.title || item.name || "",
    company: item.companyName || item.company || "",
    company_domain: item.companyUrl || item.companyDomain || "",
    location: item.location || "",
    country,
    city: item.city || (item.location || "").split(",")[0]?.trim() || "",
    url: item.url || item.link || "",
    source: board,
    raw_description: item.description || item.body || "",
    posted_date: item.postedDate || item.date || "",
    salary_min: item.salaryMin || item.salaryFrom || null,
    salary_max: item.salaryMax || item.salaryTo || null,
    remote_ok: !!(item.remote || item.remoteOk || false),
  }));
}

const ACTOR_MAP: Record<string, string> = {
  nofluffjobs: "apify/no-fluff-jobs-scraper",
  justjoinit: "apify/just-join-it-scraper",
  pracujpl: "apify/pracuj-pl-scraper",
  bestjobs: "apify/bestjobs-scraper",
  hipo: "apify/hipo-ro-scraper",
  ejobs: "apify/ejobs-ro-scraper",
  keepmeposted: "apify/keep-me-posted-scraper",
  igamingnext: "apify/igamingnext-scraper",
  gamingmalta: "apify/gaming-malta-scraper",
  stepstone: "apify/stepstone-scraper",
  xing: "apify/xing-jobs-scraper",
  werkzoeken: "apify/werkzoeken-scraper",
  indeed: "apify/indeed-scraper",
  linkedin: "apify/linkedin-jobs-scraper",
};

async function callGroq(apiKey: string, prompt: string, text: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 200,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const json = (await res.json()) as any;
  return json.choices[0].message.content;
}

async function detectLanguage(text: string, env: Env): Promise<string> {
  const snippet = text.slice(0, 300);
  try {
    const result = await callGroq(
      env.GROQ_API_KEY,
      "Detect the language of the following text. Return only the ISO 639-1 code (en, de, pl, ro, nl).",
      snippet
    );
    const lang = result.trim().toLowerCase().slice(0, 2);
    return ["en", "de", "pl", "ro", "nl"].includes(lang) ? lang : "en";
  } catch {
    return "en";
  }
}

async function scoreJob(job: JobListing, env: Env): Promise<{ ai_score: number; ai_score_reasoning: string; cv_track: number }> {
  const prompt = SCORE_PROMPT
    .replace("{title}", job.title)
    .replace("{company}", job.company)
    .replace("{country}", job.country)
    .replace("{description}", job.raw_description.slice(0, 1500));

  try {
    const result = await callGroq(env.GROQ_API_KEY, "You are a job scoring AI. Return JSON only.", prompt);
    const parsed = JSON.parse(result);
    return {
      ai_score: Math.max(1, Math.min(10, parsed.score || 5)),
      ai_score_reasoning: parsed.reasoning || "",
      cv_track: parsed.track || 1,
    };
  } catch {
    return { ai_score: 5, ai_score_reasoning: "fallback score", cv_track: 1 };
  }
}

function computeAgePenalty(postedDate: string): number {
  if (!postedDate) return 0;
  const ageDays = (Date.now() - new Date(postedDate).getTime()) / 86400000;
  if (ageDays > 21) return 2;
  if (ageDays > 14) return 1;
  return 0;
}

async function sendTelegramSummary(token: string, chatId: string, message: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
  });
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const allJobs: JobListing[] = [];
    const errors: string[] = [];

    for (const [country, boards] of Object.entries(BOARDS_BY_COUNTRY)) {
      const queries = (QUERIES as any)[country] || [];
      for (const board of boards) {
        try {
          const jobs = await retryWithBackoff(() => scrapeBoard(board, queries, country, env));
          allJobs.push(...jobs);
        } catch (e) {
          errors.push(`${country}/${board}: ${(e as Error).message}`);
        }
      }
    }

    const { data: existingRows } = await supabase.from("jobs").select("url");
    const existingUrls = new Set((existingRows || []).map((r: any) => r.url));
    const newJobs = allJobs.filter((j) => !existingUrls.has(j.url));

    const freshJobs = newJobs.filter((j) => {
      if (!j.posted_date) return true;
      const ageDays = (Date.now() - new Date(j.posted_date).getTime()) / 86400000;
      return ageDays <= 21;
    });

    const scoredJobs: ScoredJob[] = [];
    for (const job of freshJobs) {
      const lang = await detectLanguage(job.raw_description, env);
      const scoreResult = await scoreJob(job, env);
      const penalty = computeAgePenalty(job.posted_date);
      scoredJobs.push({
        ...job,
        detected_language: lang,
        ai_score: Math.max(1, scoreResult.ai_score - penalty),
        ai_score_reasoning: scoreResult.ai_score_reasoning,
        cv_track: scoreResult.cv_track,
      });
    }

    if (scoredJobs.length > 0) {
      const { error } = await supabase.from("jobs").insert(
        scoredJobs.map((j) => ({
          title: j.title,
          company: j.company,
          company_domain: j.company_domain,
          location: j.location,
          country: j.country,
          city: j.city,
          url: j.url,
          source: j.source,
          raw_description: j.raw_description,
          detected_language: j.detected_language,
          ai_score: j.ai_score,
          ai_score_reasoning: j.ai_score_reasoning,
          cv_track: j.cv_track,
          posted_date: j.posted_date,
          salary_min: j.salary_min,
          salary_max: j.salary_max,
          remote_ok: j.remote_ok,
        }))
      );
      if (error) errors.push(`Supabase insert: ${error.message}`);
    }

    const toQueue = scoredJobs.filter((j) => j.ai_score !== null && j.ai_score >= 7);
    if (toQueue.length > 0) {
      const urls = toQueue.map((j) => j.url);
      await supabase.from("jobs").update({ status: "queued" }).in("url", urls);
    }

    const summary = [
      `*JobFlow Daily Discovery*`,
      ``,
      `🌍 ${scoredJobs.length} new jobs found`,
      `⭐ ${toQueue.length} queued for generation`,
      `👀 ${scoredJobs.filter((j) => j.ai_score !== null && j.ai_score >= 5 && j.ai_score < 7).length} need review`,
      errors.length > 0 ? `⚠️ ${errors.length} board errors` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await sendTelegramSummary(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, summary);
    } catch {
      errors.push("Telegram send failed");
    }

    if (errors.length > 0) {
      console.error("Errors:", errors.join(" | "));
    }
  },
};
