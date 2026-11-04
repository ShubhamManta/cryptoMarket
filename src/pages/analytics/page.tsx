import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/index";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  RANGES,
  fetchAnalytics,
  fetchCalendar,
  selectAnalytics,
  setAnalyticsRange,
  type CalendarDay,
  type EquityPoint,
  type RangeKey,
} from "@/store/slices/cryptoSlice";


const money = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const signed = (n: number) =>
  `${n >= 0 ? "+" : "-"}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const tone = (n: number) => (n > 0 ? "g" : n < 0 ? "r" : "g");

const axis = (n: number) =>
  Math.abs(n) >= 1000
    ? `${n < 0 ? "-" : ""}$${(Math.abs(n) / 1000).toFixed(1)}k`
    : `${n < 0 ? "-" : ""}$${Math.round(Math.abs(n))}`;

const key = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;


interface Series {
  key: string;
  color: string;
  values: number[];
}

function LineChart({ labels, series }: { labels: string[]; series: Series[] }) {
  const W = 800,
    H = 270,
    L = 52,
    R = 12,
    T = 10,
    B = 28;
  const all = series.flatMap((s) => s.values);
  let min = all.length ? Math.min(...all) : 0,
    max = all.length ? Math.max(...all) : 1;
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.08;
  min -= pad;
  max += pad;
  const n = labels.length;
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, n - 1);
  const y = (v: number) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4);
  const step = Math.ceil(n / 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-svg" role="img" aria-label="Equity curve">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="an-grid" />
          <text x={L - 8} y={y(t) + 4} className="an-tick" textAnchor="end">
            {axis(t)}
          </text>
        </g>
      ))}
      {labels.map(
        (l, i) =>
          i % step === 0 && (
            <text key={i} x={x(i)} y={H - 8} className="an-tick" textAnchor="middle">
              {l.split(" ").slice(0, 2).join(" ")}
            </text>
          )
      )}
      {series.map((s) => (
        <polyline
          key={s.key}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinejoin="round"
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
        />
      ))}
    </svg>
  );
}

function BarChart({
  labels,
  values,
  height = 230,
  rotate = false,
}: {
  labels: string[];
  values: number[];
  height?: number;
  rotate?: boolean;
}) {
  const W = 800,
    L = 52,
    R = 8,
    T = 10,
    B = rotate ? 46 : 26;
  const lo = Math.min(0, ...values),
    hi = Math.max(0, ...values, 1);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (height - T - B);
  const bw = (W - L - R) / values.length;
  const step = Math.ceil(values.length / (rotate ? 36 : 12));
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="an-svg" role="img">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="an-grid" />
          <text x={L - 8} y={y(t) + 4} className="an-tick" textAnchor="end">
            {axis(t)}
          </text>
        </g>
      ))}
      {values.map((v, i) => (
        <rect
          key={i}
          x={L + i * bw + bw * 0.15}
          width={Math.max(1, bw * 0.7)}
          y={Math.min(y(v), y(0))}
          height={Math.max(1, Math.abs(y(v) - y(0)))}
          rx={1.5}
          fill={v >= 0 ? "var(--an-green)" : "var(--an-red)"}
        />
      ))}
      {labels.map(
        (l, i) =>
          i % step === 0 && (
            <text
              key={i}
              className="an-tick"
              textAnchor={rotate ? "end" : "middle"}
              transform={`translate(${L + i * bw + bw / 2}, ${height - B + 14}) ${
                rotate ? "rotate(-45)" : ""
              }`}
            >
              {l}
            </text>
          )
      )}
    </svg>
  );
}

function Gauge({ score }: { score: number }) {
  const cx = 100,
    cy = 100,
    r = 72;
  const pt = (deg: number, rad = r) => [
    cx + rad * Math.cos((deg * Math.PI) / 180),
    cy - rad * Math.sin((deg * Math.PI) / 180),
  ];
  const arc = (a: number, b: number) => {
    const [x1, y1] = pt(180 - a * 1.8),
      [x2, y2] = pt(180 - b * 1.8);
    return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
  };
  const [nx, ny] = pt(180 - score * 1.8, 60);

  return (
    <svg
      viewBox="0 0 200 118"
      className="an-gauge"
      role="img"
      aria-label={`Health score ${score}`}
    >
      <path d={arc(0, 38)} stroke="var(--an-red)" />
      <path d={arc(40, 68)} stroke="var(--an-amber)" />
      <path d={arc(70, 100)} stroke="var(--an-green)" />
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ fill: "none" }}
      />
      <circle cx={cx} cy={cy} r={4} fill="var(--an-amber)" stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}

function Donut({
  winners,
  losers,
  rate,
}: {
  winners: number;
  losers: number;
  rate: number;
}) {
  const r = 52,
    c = 2 * Math.PI * r,
    total = winners + losers;
  const w = total ? (winners / total) * c : 0;

  return (
    <svg viewBox="0 0 140 140" className="an-donut" role="img" aria-label={`Win rate ${rate}%`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--an-red)" strokeWidth="18" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--an-green)"
        strokeWidth="18"
        strokeDasharray={`${w} ${c - w}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="75" textAnchor="middle" className="an-donut-t">
        {Math.round(rate)}%
      </text>
    </svg>
  );
}

const Stat = ({
  label,
  value,
  cls = "",
}: {
  label: string;
  value: string;
  cls?: string;
}) => (
  <div className="an-card an-stat">
    <div className="an-label">{label}</div>
    <div className={`an-big ${cls}`}>{value}</div>
  </div>
);

const SERIES_META: { key: keyof EquityPoint; name: string; color: string }[] = [
  { key: "equity", name: "Equity", color: "#7c5cf0" },
  { key: "balance", name: "Balance", color: "#2fbf71" },
  { key: "pnl", name: "PnL", color: "#4f8ef7" },
  { key: "realised", name: "Realised", color: "#25c9a0" },
  { key: "unrealised", name: "Unrealised", color: "#f0556a" },
  { key: "lots", name: "Lots", color: "#f5b72f" },
];


export default function Analytics() {
  const dispatch = useAppDispatch();
  const { range, data, status, calendar } = useAppSelector(selectAnalytics);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [picked, setPicked] = useState<string | null>(key(new Date()));
  const [visible, setVisible] = useState<Record<string, boolean>>({
    equity: true,
    balance: true,
  });

  useEffect(() => {
    dispatch(fetchAnalytics(range));
  }, [dispatch, range]);

  useEffect(() => {
    dispatch(
      fetchCalendar({ year: cursor.getFullYear(), month: cursor.getMonth() })
    );
  }, [dispatch, cursor]);

  const series = useMemo<Series[]>(
    () =>
      data
        ? SERIES_META.filter((m) => visible[m.key]).map((m) => ({
            key: m.key,
            color: m.color,
            values: data.equity.map((p) => p[m.key] as number),
          }))
        : [],
    [data, visible]
  );

  const todayKey = key(new Date());
  const monthDays = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0
  ).getDate();
  const lead = cursor.getDay();
  const calVals = Object.values(calendar);
  const profitDays = calVals.filter((d) => d.pnl > 0).length;
  const lossDays = calVals.filter((d) => d.pnl < 0).length;
  const monthPnl = calVals.reduce((s, d) => s + d.pnl, 0);
  const endBalance = calVals.length ? calVals[calVals.length - 1].balance : 0;
  const sel: CalendarDay | undefined = picked ? calendar[picked] : undefined;

  const s = data?.summary;

  return (
    <div className="app">
      <Header />
      <div className="body">
        
        <Sidebar active={1} />

        <main className="an-page-container">
          <div className="an-page">
            <header className="an-head">
              <h1>
                Analytics <span className="an-beta">BETA</span>
              </h1>
              <div className="an-ranges" role="group" aria-label="Date range">
                {RANGES.map((r: RangeKey) => (
                  <button
                    key={r}
                    className={r === range ? "on" : ""}
                    aria-pressed={r === range}
                    onClick={() => dispatch(setAnalyticsRange(r))}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </header>

            {!data ? (
              <div className="an-empty">
                {status === "failed"
                  ? "Couldn't load analytics. Try another range."
                  : "Loading analytics…"}
              </div>
            ) : (
              <div className={status === "loading" ? "an-body an-busy" : "an-body"}>
                <section className="an-row an-six">
                  <Stat label="Total PnL" value={money(s!.totalPnl)} cls={tone(s!.totalPnl)} />
                  <Stat label="Win rate" value={`${s!.winRate.toFixed(2)}%`} cls="g" />
                  <Stat label="Trades" value={String(s!.trades)} />
                  <Stat
                    label="Profit factor"
                    value={s!.profitFactor.toFixed(2)}
                    cls={s!.profitFactor >= 1 ? "g" : "r"}
                  />
                  <Stat label="Max drawdown" value={money(s!.maxDrawdown)} cls="r" />
                  <Stat label="Sharpe ratio" value={s!.sharpe.toFixed(2)} cls="y" />
                </section>

                <section className="an-row an-eq">
                  <div className="an-card">
                    <div className="an-card-h">
                      <h2>Equity Curve</h2>
                      <div className="an-legend">
                        {SERIES_META.map((m) => (
                          <button
                            key={m.key}
                            className={visible[m.key] ? "" : "off"}
                            onClick={() =>
                              setVisible((v) => ({ ...v, [m.key]: !v[m.key] }))
                            }
                          >
                            <i style={{ background: m.color }} />
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <LineChart
                      labels={data.equity.map((p) => p.label)}
                      series={series}
                    />
                  </div>
                  <div className="an-card an-health">
                    <div className="an-card-h">
                      <h2>
                        <span className="an-ai">AI</span> Health Score
                      </h2>
                      <b
                        className={
                          data.health.status === "Healthy"
                            ? "g"
                            : data.health.status === "Stable"
                            ? "y"
                            : "r"
                        }
                      >
                        {data.health.score}
                      </b>
                    </div>
                    <Gauge score={data.health.score} />
                    <div className="an-gauge-label">
                      {data.health.status.toUpperCase()}
                    </div>
                    <div className="an-chips">
                      <span className="an-chip">{data.health.risk} risk</span>
                      <span className="an-chip">{data.health.status}</span>
                    </div>
                    <p>{data.health.note}</p>
                  </div>
                </section>

                <section className="an-row an-three">
                  <div className="an-card">
                    <h2>Monthly PnL</h2>
                    <BarChart
                      labels={data.monthly.map((m) => m.label)}
                      values={data.monthly.map((m) => m.pnl)}
                      height={250}
                    />
                  </div>
                  <div className="an-card">
                    <h2>Performance</h2>
                    <div className="an-perf">
                      <Donut
                        winners={data.performance.winners}
                        losers={data.performance.losers}
                        rate={data.performance.winRate}
                      />
                      <div>
                        <div>
                          Winners: <b className="g">{data.performance.winners}</b>
                        </div>
                        <div>
                          Losers: <b className="r">{data.performance.losers}</b>
                        </div>
                      </div>
                    </div>
                    <div className="an-label an-gap">By direction</div>
                    {data.performance.direction.map((d) => (
                      <div className="an-line" key={d.side}>
                        <span>
                          {d.side} · {d.trades} trades
                        </span>
                        <b className={tone(d.pnl)}>{signed(d.pnl)}</b>
                      </div>
                    ))}
                    <div className="an-two">
                      <div>
                        <div className="an-label">Lots</div>
                        <div className="an-mid">{data.performance.lots.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="an-label">Avg hold</div>
                        <div className="an-mid">{data.performance.avgHold}</div>
                      </div>
                    </div>
                  </div>
                  <div className="an-card">
                    <h2>Instruments by Pair</h2>
                    {data.instruments.map((p) => {
                      const max = Math.max(
                        ...data.instruments.map((i) => i.trades),
                        1
                      );
                      return (
                        <div className="an-pair" key={p.pair}>
                          <div className="an-line">
                            <span>{p.pair}</span>
                            <span>
                              {p.trades} trades · <b className={tone(p.pnl)}>{signed(p.pnl)}</b>
                            </span>
                          </div>
                          <div className="an-bar">
                            <i style={{ width: `${(p.trades / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="an-row an-half">
                  <div className="an-card">
                    <div className="an-card-h">
                      <h2>Daily PnL</h2>
                      <small>
                        Profit:{" "}
                        <b className="g">
                          {data.daily.filter((d) => d.pnl > 0).length}
                        </b>{" "}
                        Loss:{" "}
                        <b className="r">
                          {data.daily.filter((d) => d.pnl < 0).length}
                        </b>{" "}
                        Total:{" "}
                        <b className={tone(s!.totalPnl)}>{money(s!.totalPnl)}</b>
                      </small>
                    </div>
                    <BarChart
                      labels={data.daily.map((d) => d.label)}
                      values={data.daily.map((d) => d.pnl)}
                      height={270}
                      rotate
                    />
                  </div>
                </section>

                <section className="an-row an-half">
                  <div className="an-card">
                    <h2>Closed PnL</h2>
                    <div className="an-two">
                      <div>
                        <div className="an-label">Overall realised</div>
                        <div className={`an-mid ${tone(data.closed.overallRealised)}`}>
                          {money(data.closed.overallRealised)}
                        </div>
                      </div>
                      <div>
                        <div className="an-label">Today's PnL</div>
                        <div className={`an-mid ${tone(data.closed.todayPnl)}`}>
                          {money(data.closed.todayPnl)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="an-card">
                    <h2>Transaction Summary</h2>
                    {data.transactions.map((t) => (
                      <div className="an-line an-tx" key={t.type}>
                        <span>
                          <i className="an-dot" />
                          {t.type}
                        </span>
                        <span>
                          {t.count} txns{" "}
                          <b className={tone(t.amount)}>{money(t.amount)}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="an-row an-four">
                  <Stat label="Gross profit" value={money(data.grossProfit)} cls="g" />
                  <Stat label="Gross loss" value={money(data.grossLoss)} cls="r" />
                  <Stat label="Avg win" value={money(data.avgWin)} cls="g" />
                  <Stat label="Avg loss" value={money(data.avgLoss)} cls="r" />
                </section>
              </div>
            )}
            
            <section className="an-card an-cal">
              <h2>Trading Calendar</h2>
              <div className="an-cal-bar">
                <button
                  className="an-sq"
                  aria-label="Previous month"
                  onClick={() =>
                    setCursor(
                      new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                    )
                  }
                >
                  ‹
                </button>
                <span className="an-month">
                  {cursor.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  className="an-sq"
                  aria-label="Next month"
                  onClick={() =>
                    setCursor(
                      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                    )
                  }
                >
                  ›
                </button>
                <button
                  className="an-today"
                  onClick={() => {
                    const d = new Date();
                    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                    setPicked(key(d));
                  }}
                >
                  Today
                </button>
              </div>
              <div className="an-chips">
                <span className="an-chip">
                  Profit days: <b className="g">{profitDays}</b>
                </span>
                <span className="an-chip">
                  Loss days: <b className="r">{lossDays}</b>
                </span>
                <span className="an-chip">
                  Realised PnL: <b className={tone(monthPnl)}>{signed(monthPnl)}</b>
                </span>
                <span className="an-chip">
                  End balance: <b className="g">{money(endBalance)}</b>
                </span>
              </div>
              <div className="an-grid7">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                  <div key={d} className="an-dow">
                    {d}
                  </div>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: monthDays }, (_, i) => {
                  const d = new Date(
                    cursor.getFullYear(),
                    cursor.getMonth(),
                    i + 1
                  );
                  const k = key(d),
                    rec = calendar[k];
                  const cls = [
                    "an-day",
                    rec ? (rec.pnl >= 0 ? "win" : "loss") : "",
                    k === picked ? "picked" : "",
                    k === todayKey ? "now" : "",
                  ].join(" ");
                  return (
                    <button key={k} className={cls} onClick={() => setPicked(k)}>
                      <span>{i + 1}</span>
                      <em className={rec ? tone(rec.pnl) : ""}>
                        {rec ? signed(rec.pnl) : "—"}
                      </em>
                    </button>
                  );
                })}
              </div>

              {picked && (
                <div className="an-detail">
                  <div className="an-card-h">
                    <div>
                      <h3>
                        {new Date(`${picked}T00:00:00`).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </h3>
                      <div className={`an-mid ${sel ? tone(sel.pnl) : "g"}`}>
                        {signed(sel?.pnl ?? 0)}
                      </div>
                    </div>
                    <button
                      className="an-sq"
                      aria-label="Close details"
                      onClick={() => setPicked(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="an-sum">
                    {(
                      [
                        ["Realised PnL", signed(sel?.pnl ?? 0), tone(sel?.pnl ?? 0)],
                        ["Trades", String(sel?.trades ?? 0), ""],
                        ["Gross profit", signed(sel?.grossProfit ?? 0), "g"],
                        ["Gross loss", signed(-(sel?.grossLoss ?? 0)), "r"],
                        ["Long", String(sel?.long ?? 0), ""],
                        ["Short", String(sel?.short ?? 0), ""],
                        [
                          "Profit factor",
                          (sel?.profitFactor ?? 0).toFixed(2),
                          sel && sel.profitFactor >= 1 ? "g" : "r",
                        ],
                        ["Sharpe", (sel?.sharpe ?? 0).toFixed(2), "y"],
                        ["Avg hold", sel?.avgHold ?? "—", ""],
                        ["Max DD", signed(-(sel?.maxDD ?? 0)), "r"],
                      ] as [string, string, string][]
                    ).map(([l, v, c]) => (
                      <div className="an-line" key={l}>
                        <span>{l}</span>
                        <b className={c}>{v}</b>
                      </div>
                    ))}
                  </div>
                  <div className="an-balance">
                    <span>Balance</span>
                    <b>{money(sel?.balance ?? 0)}</b>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
