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

// one accent: lime for the good outcome, neutrals for the rest
const PIE_COLORS = ["#B4FF2F", "#5A5D66", "#F1F1EE"];

export default function Analytics() {
  return (
    <div className="space-y-10">
      <div>
        <span className="mono nr-kick">
          <i aria-hidden="true" />
          Overview
        </span>
        <h1 className="nr-title" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
          Call <b>analytics</b>
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="cup-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="mono"
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
                    background: "#0B0C10",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--fg)",
                  }}
                  itemStyle={{ color: "var(--fg)" }}
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
        <div className="cup-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className="mono"
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
                    background: "#0B0C10",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--fg)",
                  }}
                  itemStyle={{ color: "var(--fg)" }}
                />
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  label
                  stroke="#0B0C10"
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
