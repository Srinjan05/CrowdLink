import { useId } from "react";

export type TrendPoint = { label: string; value: number };

function buildPath(points: { x: number; y: number }[], height: number) {
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const area =
    `M${points[0].x},${height} ` +
    points.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1].x},${height} Z`;
  return { line, area };
}

export function Sparkline({
  data,
  className = "text-accent",
}: {
  data: number[];
  className?: string;
}) {
  const w = 100;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={`h-9 w-full ${className}`}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function AreaChart({
  data,
  className = "text-accent",
  color,
  height = 176,
}: {
  data: TrendPoint[];
  className?: string;
  color?: string;
  height?: number;
}) {
  const w = 100;
  const h = 40;
  const gradId = useId();
  const max = Math.max(...data.map((d) => d.value), 1) * 1.1;
  const points =
    data.length === 1
      ? [{ x: w / 2, y: h - (data[0].value / max) * (h - 4) - 2 }]
      : data.map((d, i) => ({
          x: (i / (data.length - 1)) * w,
          y: h - (d.value / max) * (h - 4) - 2,
        }));
  const { line, area } = buildPath(points, h);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      style={{ color, height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BarChart({
  data,
  className = "text-accent",
  color,
  height = 176,
}: {
  data: TrendPoint[];
  className?: string;
  color?: string;
  height?: number;
}) {
  const w = 100;
  const h = 40;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const gap = 1.5;
  const barW = (w - gap * (data.length - 1)) / data.length;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      style={{ color, height }}
      aria-hidden
    >
      {data.map((d, i) => {
        const barH = (d.value / max) * (h - 2);
        const x = i * (barW + gap);
        return (
          <rect
            key={d.label}
            x={x}
            y={h - barH}
            width={barW}
            height={barH}
            rx={1.2}
            fill="currentColor"
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

export function DonutChart({
  data,
  title,
  height = 176,
}: {
  data: { label: string; value: number }[];
  title?: string;
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = [
    "var(--color-accent)",
    "#ec4899",
    "#06b6d4",
    "#a1a1aa",
  ];
  const r = 42;
  const c = 2 * Math.PI * r;

  const segments = data.reduce<{ len: number; color: string; start: number }[]>(
    (acc, d, i) => {
      const len = (d.value / total) * c;
      const start = acc.length
        ? acc[acc.length - 1].start + acc[acc.length - 1].len
        : 0;
      acc.push({ len, color: colors[i % colors.length], start });
      return acc;
    },
    []
  );

  return (
    <div className="flex items-center gap-6" style={{ minHeight: height }}>
      <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="12"
        />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={`${s.len} ${c - s.len}`}
            strokeDashoffset={-s.start}
          />
        ))}
        {title && (
          <text
            className="rotate-90 fill-muted-foreground text-center"
            style={{ transformOrigin: "50px 50px" }}
            x="50"
            y="50"
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-geist-sans), system-ui"
          >
            {title}
          </text>
        )}
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-medium">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
