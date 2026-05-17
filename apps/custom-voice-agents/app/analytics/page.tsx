"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = Array.from({ length: 7 }, (_, i) => ({
  d: `D${i + 1}`,
  calls: Math.round((Math.sin(i) + 1) * 5 + 3),
}));
const pie = [
  { name: "Completed", value: 18 },
  { name: "Failed", value: 4 },
  { name: "Ongoing", value: 2 },
];

const PIE_COLORS = [
  "oklch(0.65 0.18 145)",
  "oklch(0.58 0.21 40)",
  "oklch(0.78 0.18 50)",
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-[13px] font-medium tracking-[-0.01em] m-0 mb-1.5"
          style={{ color: "var(--cup-accent-d)" }}
        >
          Overview
        </p>
        <h1
          className="font-bold leading-[1.05] tracking-[-0.04em] m-0"
          style={{ color: "var(--cup-ink)", fontSize: "clamp(28px, 3.6vw, 40px)" }}
        >
          Analytics
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="cup-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[11px] uppercase tracking-[0.16em]"
              style={{ color: "var(--cup-ink-3)" }}
            >
              Calls
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--cup-ink-3)" }}
            >
              7d
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="d"
                  stroke="var(--cup-ink-3)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--cup-ink-3)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--cup-surface)",
                    border: "1px solid var(--cup-rule)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="var(--cup-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--cup-accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="cup-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[11px] uppercase tracking-[0.16em]"
              style={{ color: "var(--cup-ink-3)" }}
            >
              Outcomes
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "var(--cup-surface)",
                    border: "1px solid var(--cup-rule)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  label
                  stroke="var(--cup-surface)"
                  strokeWidth={2}
                >
                  {pie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
