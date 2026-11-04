export type Tone = "up" | "down" | "flat";
export type OrderType = "Market" | "Limit" | "Stop";
export type Side = "buy" | "sell";
export type PositionTab = "Open" | "Pending" | "Close";

export interface SymbolQuote {
  symbol: string;
  bid: string;
  ask: string;
  spread: number;
  tone?: Tone;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface OrderRequest {
  symbol: string;
  type: OrderType;
  lots: number;
  side: Side;
}

export const POSITION_COLUMNS = [
  "Instrument", "Type", "Lots", "Open Price", "Current Price", "S/L", "TSL",
  "TP", "Commission", "Swap", "P/L", "Open Time", "Trade Id", "Comment",
] as const;
export type PositionColumn = (typeof POSITION_COLUMNS)[number];
export type PositionRow = Partial<Record<PositionColumn, string | number>>;