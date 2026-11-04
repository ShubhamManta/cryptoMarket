import { configureStore } from "@reduxjs/toolkit";
import cryptoReducer from "./slices/cryptoSlice";
import authReducer from "./slices/authStore";
import fundsReducer from "./slices/fundsSlice";

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    auth: authReducer,
    funds: fundsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
