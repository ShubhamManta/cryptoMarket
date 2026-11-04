import { useState } from "react";
import { POSITION_COLUMNS, type PositionRow, type PositionTab } from "@/utils/types";
import {
  useAppDispatch,
  useAppSelector,
  getOpenPositions,
  getPendingOrders,
  getClosedPositions,
  closeAllTrades,
} from "@/store/index";

interface PositionsPanelProps {
  open?: PositionRow[];
  pending?: PositionRow[];
  pnl?: number;
}

const tabs: PositionTab[] = ["Open", "Pending", "Close"];

export default function PositionsPanel({
  open,
  pending,
  pnl,
}: PositionsPanelProps) {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<PositionTab>("Open");

  const reduxOpen = useAppSelector(getOpenPositions);
  const reduxPending = useAppSelector(getPendingOrders);
  const reduxClosed = useAppSelector(getClosedPositions);

  const openList = open ?? (reduxOpen as PositionRow[]);
  const pendingList = pending ?? (reduxPending as PositionRow[]);
  const closedList = reduxClosed as PositionRow[];

  const rows: PositionRow[] =
    tab === "Open" ? openList : tab === "Pending" ? pendingList : closedList;

  const count = (t: PositionTab): number =>
    t === "Open"
      ? openList.length
      : t === "Pending"
      ? pendingList.length
      : closedList.length;

  // Calculate total unrealised P/L if not passed
  const calculatedPnl =
    pnl ??
    reduxOpen.reduce((acc, t) => {
      const val = parseFloat((t["P/L"] || "").replace(/[^0-9.-]/g, ""));
      return isNaN(val) ? acc : acc + val;
    }, 0);

  const isPositivePnl = calculatedPnl >= 0;

  return (
    <section className="panel positions">
      <div className="pos-top">
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t}
              className={t === tab ? "tab on" : "tab"}
              onClick={() => setTab(t)}
            >
              {t} <i className="count">{count(t)}</i>
            </button>
          ))}
        </div>
        <div className="pnl">
          Unrealised P/L:{" "}
          <b className={isPositivePnl ? "green-t" : "red-t"}>
            {isPositivePnl ? "+" : ""}€{calculatedPnl.toFixed(2)}
          </b>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: "6px 14px", fontSize: "12px", marginLeft: "8px" }}
            onClick={() => dispatch(closeAllTrades())}
          >
            Close All
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {POSITION_COLUMNS.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {POSITION_COLUMNS.map((c) => {
                  const val = r[c] ?? "-";
                  const isPnlCol = c === "P/L";
                  const pnlStr = String(val);
                  const isGreen = pnlStr.startsWith("+");
                  const isRed = pnlStr.startsWith("-") && pnlStr !== "-";

                  return (
                    <td
                      key={c}
                      className={
                        isPnlCol
                          ? isGreen
                            ? "green-t"
                            : isRed
                            ? "red-t"
                            : ""
                          : ""
                      }
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="empty">
            No {tab === "Pending" ? "Pending Orders" : tab === "Close" ? "Closed Trades" : "Open Positions"}
          </div>
        )}
      </div>
    </section>
  );
}
