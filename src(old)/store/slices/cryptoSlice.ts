
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: string;
  volume24h: string;
  lastUpdated: number;
}

export interface CryptoState {
  prices: Record<string, CryptoPrice>;
  connectionStatus: "connected" | "disconnected" | "connecting";
  error: string | null;
}

const initialState: CryptoState = {
  prices: {},
  connectionStatus: "disconnected",
  error: null,
};

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    updatePrice: (state, action: PayloadAction<CryptoPrice>) => {
      state.prices[action.payload.symbol] = action.payload;
    },

    updatePrices: (state, action: PayloadAction<CryptoPrice[]>) => {
      action.payload.forEach((crypto) => {
        state.prices[crypto.symbol] = crypto;
      });
    },

    setConnectionStatus: (
      state,
      action: PayloadAction<CryptoState["connectionStatus"]>
    ) => {
      state.connectionStatus = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearPrices: (state) => {
      state.prices = {};
    },
  },
});

export const {
  updatePrice,
  updatePrices,
  setConnectionStatus,
  setError,
  clearPrices,
} = cryptoSlice.actions;

export default cryptoSlice.reducer;
