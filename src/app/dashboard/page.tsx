export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-[#000000] leading-[1.23] tracking-[-0.625px]">Dashboard</h1>
        <p className="text-sm text-[#615d59] mt-1">Overview of your job search activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Applications", value: "—", accent: "text-[#0075de]" },
          { label: "Upcoming Interviews", value: "—", accent: "text-[#62aef0]" },
          { label: "Pending Offers", value: "—", accent: "text-[#1aae39]" },
          { label: "Visa Progress", value: "—", accent: "text-[#dd5b00]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-[#e6e6e6] p-4">
            <div className="text-xs font-semibold tracking-[0.125px] text-[#a39e98] uppercase">{stat.label}</div>
            <div className={`text-[40px] font-bold leading-[1.0] tracking-[-1px] mt-1 ${stat.accent}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#e6e6e6] p-6">
        <h2 className="text-lg font-semibold text-[#000000]">Recent Activity</h2>
        <p className="text-sm text-[#615d59] mt-2">Connect your job boards and API keys to get started. Check the README for required setup.</p>
      </div>
    </div>
  );
}
