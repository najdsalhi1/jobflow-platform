export const QUERIES = {
  Poland: [
    '"SDR" OR "Sales Development Representative" AND "English" Warsaw OR Wroclaw',
    '"Customer Success" AND "English" Poland AND NOT "Senior" AND NOT "Director"',
    '"Arabic" AND "Sales" Poland',
    '"Multilingual" AND "B2B" Poland',
  ],
  Romania: [
    '"Sales" AND "English" Bucharest AND NOT "Senior"',
    '"Customer Support" AND ("Arabic" OR "French") Romania',
    '"B2B" AND "English" Bucharest',
  ],
  Malta: [
    '"Customer Support" AND "English" Malta NOT "Remote"',
    '"KYC" AND "Malta" AND "English" NOT "Senior"',
    '"Sales" Malta AND ("iGaming" OR "Fintech" OR "Crypto")',
    '"Arabic" speaker Malta',
  ],
  Germany: [
    '"SDR" OR "Vertrieb" AND "Englisch" Deutschland NOT "Senior"',
    '"Kundenbetreuung" AND "Englisch" Germany',
    '"Arabic" AND "Sales" Germany',
  ],
  Netherlands: [
    '"SDR" OR "Inside Sales" Amsterdam AND "English"',
    '"Customer Success" Amsterdam AND NOT "Senior"',
    '"Multilingual" AND "B2B" Netherlands',
  ],
};

export const APIFY_ACTORS: Record<string, string> = {
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

export const BOARDS_BY_COUNTRY: Record<string, string[]> = {
  Poland: ["nofluffjobs", "justjoinit", "pracujpl", "linkedin"],
  Romania: ["bestjobs", "hipo", "ejobs", "linkedin"],
  Malta: ["keepmeposted", "igamingnext", "gamingmalta", "linkedin"],
  Germany: ["stepstone", "xing", "linkedin"],
  Netherlands: ["linkedin", "werkzoeken", "indeed"],
};

export const SCORE_PROMPT = `Score this job for a candidate with the following profile:
- 3+ years SaaS sales experience (SDR → AE)
- Native Arabic, fluent English, intermediate French
- Targeting SDR, Customer Success, and Account Executive roles
- Seeking EU work sponsorship in Poland, Romania, Malta, Germany, or Netherlands
- Prefers B2B tech, fintech, and iGaming sectors

Return JSON: { "score": 1-10, "reasoning": "brief reason", "track": 1-6 }
Track mapping: 1=English SDR/AE, 2=French SDR/AE, 3=English CS, 4=French CS, 5=Entry-level, 6=Arabic-specific

Job title: {title}
Company: {company}
Country: {country}
Description: {description}`;
