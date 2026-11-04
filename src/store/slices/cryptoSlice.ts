import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  analyticsInitialState, buildAnalytics, buildCalendarMonth, sleep,
  type AnalyticsData, type AnalyticsState, type CalendarDay, type RangeKey,
} from "@/utils/analyticsData";

export { RANGES, RANGE_DAYS } from "@/utils/analyticsData";
export type {
  RangeKey, AnalyticsData, AnalyticsState, CalendarDay, EquityPoint, DailyPnl,
} from "@/utils/analyticsData";

const BASES = [
  "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "TRX", "AVAX", "LINK",
  "DOT", "POL", "LTC", "BCH", "SHIB", "UNI", "ATOM", "XLM", "ETC", "NEAR",
  "APT", "FIL", "ARB", "OP", "INJ", "HBAR", "VET", "ICP", "AAVE", "MKR",
  "GRT", "ALGO", "RUNE", "SAND", "MANA", "AXS", "THETA", "EOS", "XTZ", "FLOW",
  "CHZ", "EGLD", "KAVA", "SNX", "CRV", "LDO", "COMP", "ZEC", "DASH", "NEO",
  "IOTA", "ENJ", "BAT", "ZIL", "1INCH", "SUSHI", "YFI", "ANKR", "CELO", "QTUM",
  "ONT", "SUI", "SEI", "TIA", "PEPE", "WIF", "FET", "RENDER", "IMX", "STX",
  "GALA", "APE", "DYDX", "PENDLE", "JUP", "ENA", "ONDO", "TON", "BONK", "FLOKI",
  "WLD", "ORDI", "JASMY", "LRC", "ENS", "MINA", "KSM", "ROSE", "ZRX", "BAND",
  "STORJ", "SKL", "CFX", "AR", "TAO", "ICX", "WOO", "GMT", "BLUR", "PYTH",
];

export const INITIAL_SYMBOLS: string[] = BASES.map((b) => `${b}USDT`);

export interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: string;
  volume24h: string;
  lastUpdated: number;
}

export interface TradeHistoryItem {
  Instrument: string;
  Type: "Buy" | "Sell";
  Lots: number;
  "Open Price": string;
  "Current Price": string;
  "S/L": string;
  TSL: string;
  TP: string;
  Commission: string;
  Swap: string;
  "P/L": string;
  "Open Time": string;
  "Trade Id": string;
  Comment: string;
  orderType?: "Market" | "Limit" | "Stop";
  status?: "Open" | "Pending" | "Close";
}

export interface CryptoState {
  symbols: string[];
  prices: Record<string, CryptoPrice>;
  connectionStatus: "connected" | "disconnected" | "connecting";
  error: string | null;
  tradeHistory: TradeHistoryItem[];
  analytics: AnalyticsState;
}

export type WithCrypto = { crypto: CryptoState };

const initialState: CryptoState = {
  symbols: INITIAL_SYMBOLS,
  prices: {},
  connectionStatus: "disconnected",
  error: null,
  tradeHistory: [],
  analytics: analyticsInitialState, 
};

export const fetchAnalytics = createAsyncThunk<AnalyticsData, RangeKey>(
  "crypto/fetchAnalytics",
  async (range) => {
    await sleep(350);
    return buildAnalytics(range);
  }
);

export const fetchCalendar = createAsyncThunk<
  { key: string; days: Record<string, CalendarDay> },
  { year: number; month: number }
>("crypto/fetchCalendar", async ({ year, month }) => {
  await sleep(150);
  return { key: `${year}-${String(month + 1).padStart(2, "0")}`, days: buildCalendarMonth(year, month) };
});

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    updatePrices: (state, action: PayloadAction<CryptoPrice[]>) => {
      action.payload.forEach((crypto) => {
        state.prices[crypto.symbol] = crypto;
      });

      if (state.tradeHistory && state.tradeHistory.length > 0) {
        state.tradeHistory.forEach((trade) => {
          if (trade.status === "Open" || (!trade.status && trade.orderType === "Market")) {
            const sym = trade.Instrument.replace("-USD", "USDT").replace("/", "");
            const live = state.prices[sym] || state.prices[trade.Instrument];
            if (live) {
              const cur = parseFloat(live.price);
              trade["Current Price"] = cur.toFixed(2);
              const open = parseFloat(trade["Open Price"]);
              if (!isNaN(cur) && !isNaN(open)) {
                const diff = trade.Type === "Buy" ? cur - open : open - cur;
                const pnl = diff * trade.Lots;
                trade["P/L"] = (pnl >= 0 ? "+" : "") + "€" + pnl.toFixed(2);
              }
            }
          }
        });
      }
    },

    updatePrice: (state, action: PayloadAction<CryptoPrice>) => {
      state.prices[action.payload.symbol] = action.payload;
    },

    setConnectionStatus: (state, action: PayloadAction<CryptoState["connectionStatus"]>) => {
      state.connectionStatus = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearPrices: (state) => {
      state.prices = {};
      state.error = null;
    },

    addTrade: (state, action: PayloadAction<TradeHistoryItem>) => {
      state.tradeHistory.unshift(action.payload);
    },

    closeTrade: (state, action: PayloadAction<string>) => {
      const trade = state.tradeHistory.find((t) => t["Trade Id"] === action.payload);
      if (trade) {
        trade.status = "Close";
      }
    },

    closeAllTrades: (state) => {
      state.tradeHistory.forEach((t) => {
        if (t.status === "Open" || (!t.status && t.orderType === "Market")) {
          t.status = "Close";
        }
      });
    },

    clearTradeHistory: (state) => {
      state.tradeHistory = [];
    },

    setAnalyticsRange: (state, action: PayloadAction<RangeKey>) => {
      state.analytics.range = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (s) => { s.analytics.status = "loading"; })
      .addCase(fetchAnalytics.fulfilled, (s, a) => {
        s.analytics.status = "succeeded";
        s.analytics.data = a.payload;
      })
      .addCase(fetchAnalytics.rejected, (s) => { s.analytics.status = "failed"; })
      .addCase(fetchCalendar.pending, (s) => { s.analytics.calendarStatus = "loading"; })
      .addCase(fetchCalendar.fulfilled, (s, a) => {
        s.analytics.calendarStatus = "succeeded";
        s.analytics.calendarMonth = a.payload.key;
        s.analytics.calendar = a.payload.days;
      })
      .addCase(fetchCalendar.rejected, (s) => { s.analytics.calendarStatus = "failed"; });
  },
});

export const {
  updatePrices,
  updatePrice,
  setConnectionStatus,
  setError,
  clearPrices,
  addTrade,
  closeTrade,
  closeAllTrades,
  clearTradeHistory,
  setAnalyticsRange,
} = cryptoSlice.actions;

export const getPrices = (state: WithCrypto): Record<string, CryptoPrice> => state.crypto.prices;
export const selectPrices = getPrices;

export const getPriceBySymbol = (state: WithCrypto, symbol: string): CryptoPrice | undefined =>
  state.crypto.prices[symbol];
export const selectPriceBySymbol = getPriceBySymbol;

export const getAllPrices = (state: WithCrypto): CryptoPrice[] => Object.values(state.crypto.prices);
export const selectAllPrices = getAllPrices;

export const getSymbols = (state: WithCrypto): string[] => state.crypto.symbols;
export const selectSymbols = getSymbols;

export const getConnectionStatus = (state: WithCrypto): CryptoState["connectionStatus"] =>
  state.crypto.connectionStatus;
export const selectConnectionStatus = getConnectionStatus;

export const getCryptoError = (state: WithCrypto): string | null => state.crypto.error;
export const selectCryptoError = getCryptoError;

export const getTradeHistory = (state: WithCrypto): TradeHistoryItem[] =>
  state.crypto.tradeHistory || [];
export const selectTradeHistory = getTradeHistory;

export const getOpenPositions = (state: WithCrypto): TradeHistoryItem[] =>
  (state.crypto.tradeHistory || []).filter(
    (t) => t.status === "Open" || (!t.status && t.orderType === "Market")
  );
export const selectOpenPositions = getOpenPositions;

export const getPendingOrders = (state: WithCrypto): TradeHistoryItem[] =>
  (state.crypto.tradeHistory || []).filter(
    (t) => t.status === "Pending" || (!t.status && (t.orderType === "Limit" || t.orderType === "Stop"))
  );
export const selectPendingOrders = getPendingOrders;

export const getClosedPositions = (state: WithCrypto): TradeHistoryItem[] =>
  (state.crypto.tradeHistory || []).filter((t) => t.status === "Close");
export const selectClosedPositions = getClosedPositions;

export const selectAnalytics = (state: WithCrypto): AnalyticsState => state.crypto.analytics;
export const selectAnalyticsRange = (state: WithCrypto): RangeKey => state.crypto.analytics.range;

export default cryptoSlice.reducer;