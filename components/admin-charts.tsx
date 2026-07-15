"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const INK = "hsl(0, 14%, 17%)";
const INK_MUTED = "hsla(0, 14%, 17%, 0.55)";
const STAMP = "hsl(180, 92%, 30%)";
const STAMP_SOFT = "hsl(180, 60%, 55%)";

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: "8px",
  fontSize: "12px",
  color: INK,
};

export function SignupsLineChart({ data }: { data: { day: string; clients: number; creatives: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: INK_MUTED }}
          tickFormatter={(d: string) => d.slice(5)}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10, fill: INK_MUTED }} allowDecimals={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="clients" stroke={STAMP} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="creatives" stroke={STAMP_SOFT} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

type Split = { label: string; clients: number; creatives: number };

export function JobStatusBarChart({ data }: { data: Split[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} />
        <YAxis tick={{ fontSize: 10, fill: INK_MUTED }} allowDecimals={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="clients" stackId="a" fill={STAMP} radius={[0, 0, 0, 0]} />
        <Bar dataKey="creatives" stackId="a" fill={STAMP_SOFT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PeriodBarChart({
  data,
  format = "count",
  highlightLast = false,
  height = 180,
  seriesLabel,
}: {
  data: { label: string; value: number }[];
  format?: "mwk" | "count";
  highlightLast?: boolean;
  height?: number;
  seriesLabel?: string;
}) {
  const isMwk = format === "mwk";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} />
        <YAxis
          tick={{ fontSize: 10, fill: INK_MUTED }}
          width={44}
          allowDecimals={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          formatter={((v: number) => [
            isMwk ? `MWK ${v.toLocaleString()}` : v.toLocaleString(),
            seriesLabel || (isMwk ? "Amount" : "Count"),
          ]) as any}
        />
        <Bar dataKey="value" fill={STAMP} radius={[4, 4, 0, 0]}>
          {highlightLast &&
            data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? STAMP : "hsla(180, 60%, 55%, 0.45)"} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TwoSeriesBarChart({
  data,
  aKey,
  bKey,
  aLabel,
  bLabel,
  height = 180,
}: {
  data: { label: string; [k: string]: string | number }[];
  aKey: string;
  bKey: string;
  aLabel: string;
  bLabel: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} />
        <YAxis tick={{ fontSize: 10, fill: INK_MUTED }} width={32} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey={aKey} name={aLabel} fill={STAMP} radius={[4, 4, 0, 0]} />
        <Bar dataKey={bKey} name={bLabel} fill={INK} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OutcomeDonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={((v: number, name: string) => [`${v} (${total ? Math.round((v / total) * 100) : 0}%)`, name]) as any}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl text-ink">{centerValue}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink/55">{centerLabel}</span>
      </div>
    </div>
  );
}

export function JobCategoryBarChart({ data }: { data: Split[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: INK_MUTED }} allowDecimals={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} width={110} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="clients" stackId="a" fill={STAMP} />
        <Bar dataKey="creatives" stackId="a" fill={STAMP_SOFT} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
