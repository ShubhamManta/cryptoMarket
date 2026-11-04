import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TradingAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  equity: number;
  flag: string;
  server: string;
  accountCategory: "Live" | "Demo";
  type: string;
  platform: string;
  leverage: string;
  password?: string;
  createdAt?: string;
}

export interface FundTransaction {
  id: string;
  accountId: string; // Account ID or Wallet No.
  amount: number;
  currency: string;
  status: "Approved" | "Pending" | "Rejected";
  method: "Bank" | "Crypto" | "Mastercard/Visa" | "Internal Transfer";
  type: "Deposit" | "Withdrawal" | "Transfer";
  date: string;
  reference?: string;
}

export interface BankDetails {
  minimumDeposit: string;
  holderName: string;
  accountNumber: string;
  bankName: string;
  swiftBic: string;
  iban: string;
  address: string;
  sortCode?: string;
  transitNumber?: string;
}

export const BANK_DETAILS_BY_CURRENCY: Record<string, BankDetails> = {
  AED: {
    minimumDeposit: "$500",
    holderName: "Finvasia Capital South Africa (PTY) Ltd",
    accountNumber: "00000230",
    bankName: "SETTLEGO SOLUTIONS LIMITED",
    swiftBic: "SEOUGB2L",
    iban: "GB73SEOU00985900000230",
    address: "Floor 13, The Bower Building, 207-211 Old Street, London, England, EC1V 9NR",
  },
  USD: {
    minimumDeposit: "$500",
    holderName: "FC Global Ltd",
    accountNumber: "59343809",
    bankName: "ClearBank Limited",
    swiftBic: "CLRBGB22",
    iban: "GB46CLRB04271459343809",
    address: "BOROUGH YARDS, 13 DIRTY LANE, LONDON, SE19PA",
    sortCode: "042714",
  },
  EUR: {
    minimumDeposit: "€500",
    holderName: "Finvasia Capital Europe Ltd",
    accountNumber: "88341902",
    bankName: "BNP Paribas S.A.",
    swiftBic: "BNPAFR21",
    iban: "FR7630004000018834190234",
    address: "16 Boulevard des Italiens, 75009 Paris, France",
  },
  CAD: {
    minimumDeposit: "CAD $500",
    holderName: "FC Capital Americas Inc",
    accountNumber: "10492850",
    bankName: "Royal Bank of Canada",
    swiftBic: "ROYCCAT2",
    iban: "CA82ROYC0012210492850123",
    transitNumber: "00122",
    address: "200 Bay Street, Toronto, ON M5J 2J5, Canada",
  },
};

export interface FundsState {
  accounts: TradingAccount[];
  selectedAccountId: string;
  transactions: FundTransaction[];
}

const INITIAL_ACCOUNTS: TradingAccount[] = [
  {
    id: "3000008",
    name: "Live Raw Spread",
    currency: "USD",
    balance: 28400.5,
    equity: 28400.5,
    flag: "🇺🇸",
    server: "Lieark-Live01",
    accountCategory: "Live",
    type: "Raw ECN",
    platform: "ActTrader",
    leverage: "500x",
    password: "•••••",
  },
  {
    id: "3000009",
    name: "Live ECN Pro",
    currency: "EUR",
    balance: 14250.0,
    equity: 14250.0,
    flag: "🇪🇺",
    server: "Lieark-Live01",
    accountCategory: "Live",
    type: "Premium ECN",
    platform: "ActTrader",
    leverage: "500x",
    password: "•••••",
  },
  {
    id: "3000010",
    name: "Live VIP Prime",
    currency: "GBP",
    balance: 9820.0,
    equity: 9820.0,
    flag: "🇬🇧",
    server: "Lieark-Live02",
    accountCategory: "Live",
    type: "Raw ECN",
    platform: "ActTrader",
    leverage: "500x",
    password: "•••••",
  },
  {
    id: "500037",
    name: "Standard Micro",
    currency: "GBP",
    balance: 1450.0,
    equity: 1450.0,
    flag: "🇬🇧",
    server: "Lieark-Live02",
    accountCategory: "Live",
    type: "Raw ECN",
    platform: "ActTrader",
    leverage: "500x",
    password: "•••••",
  },
  {
    id: "T1252",
    name: "Master Trading Pool",
    currency: "EUR",
    balance: 50000.0,
    equity: 50000.0,
    flag: "🇪🇺",
    server: "Lieark-Live01",
    accountCategory: "Live",
    type: "Premium ECN",
    platform: "ActTrader",
    leverage: "500x",
    password: "•••••",
  },
];

const INITIAL_TRANSACTIONS: FundTransaction[] = [
  {
    id: "TX-948201",
    accountId: "3000009",
    amount: 5000.0,
    currency: "EUR",
    status: "Approved",
    method: "Bank",
    type: "Deposit",
    date: "2026-11-04 10:15:22",
    reference: "For trading account 3000009",
  },
  {
    id: "TX-948182",
    accountId: "0x71C839...52F1",
    amount: 1200.0,
    currency: "USDT",
    status: "Approved",
    method: "Crypto",
    type: "Deposit",
    date: "2026-11-03 16:42:10",
    reference: "USDT-ERC20 Deposit to 3000008",
  },
  {
    id: "TX-948011",
    accountId: "3000008",
    amount: 1500.0,
    currency: "USD",
    status: "Pending",
    method: "Bank",
    type: "Withdrawal",
    date: "2026-11-03 09:20:45",
    reference: "Wire to Chase Bank *3904",
  },
  {
    id: "TX-947932",
    accountId: "3000009 -> 3000008",
    amount: 1000.0,
    currency: "EUR",
    status: "Approved",
    method: "Internal Transfer",
    type: "Transfer",
    date: "2026-11-02 18:05:14",
    reference: "Internal transfer to USD account",
  },
  {
    id: "TX-947650",
    accountId: "3000010",
    amount: 750.0,
    currency: "GBP",
    status: "Approved",
    method: "Mastercard/Visa",
    type: "Deposit",
    date: "2026-11-01 11:33:02",
    reference: "Card deposit ending in 4421",
  },
  {
    id: "TX-947419",
    accountId: "1A1zP1e...P62B",
    amount: 0.25,
    currency: "BTC",
    status: "Approved",
    method: "Crypto",
    type: "Withdrawal",
    date: "2026-10-31 14:12:59",
    reference: "Cold storage withdrawal from 3000008",
  },
  {
    id: "TX-947118",
    accountId: "500037",
    amount: 250.0,
    currency: "GBP",
    status: "Rejected",
    method: "Mastercard/Visa",
    type: "Deposit",
    date: "2026-10-30 08:44:19",
    reference: "Card expired or blocked by 3DS",
  },
];

const initialState: FundsState = {
  accounts: INITIAL_ACCOUNTS,
  selectedAccountId: "3000009",
  transactions: INITIAL_TRANSACTIONS,
};

const fundsSlice = createSlice({
  name: "funds",
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    depositFunds: (
      state,
      action: PayloadAction<{
        accountId: string;
        amount: number;
        currency: string;
        method: "Bank" | "Crypto" | "Mastercard/Visa";
        walletOrIban?: string;
        reference?: string;
      }>
    ) => {
      const { accountId, amount, currency, method, walletOrIban, reference } = action.payload;
      const account = state.accounts.find((a) => a.id === accountId);
      if (account) {
        account.balance += amount;
        account.equity += amount;
      }

      const newTx: FundTransaction = {
        id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        accountId: walletOrIban || accountId,
        amount,
        currency,
        status: method === "Bank" ? "Pending" : "Approved",
        method,
        type: "Deposit",
        date: new Date().toISOString().replace("T", " ").substring(0, 19),
        reference: reference || `Deposit via ${method} for ${accountId}`,
      };

      state.transactions.unshift(newTx);
    },
    withdrawFunds: (
      state,
      action: PayloadAction<{
        accountId: string;
        amount: number;
        currency: string;
        method: "Bank" | "Crypto" | "Mastercard/Visa";
        destination: string;
      }>
    ) => {
      const { accountId, amount, currency, method, destination } = action.payload;
      const account = state.accounts.find((a) => a.id === accountId);
      if (account && account.balance >= amount) {
        account.balance -= amount;
        account.equity -= amount;
      }

      const newTx: FundTransaction = {
        id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        accountId: destination || accountId,
        amount,
        currency,
        status: "Pending",
        method,
        type: "Withdrawal",
        date: new Date().toISOString().replace("T", " ").substring(0, 19),
        reference: `Withdrawal request from account ${accountId} to ${destination}`,
      };

      state.transactions.unshift(newTx);
    },
    internalTransfer: (
      state,
      action: PayloadAction<{
        fromAccountId: string;
        toAccountId: string;
        amount: number;
      }>
    ) => {
      const { fromAccountId, toAccountId, amount } = action.payload;
      const fromAcc = state.accounts.find((a) => a.id === fromAccountId);
      const toAcc = state.accounts.find((a) => a.id === toAccountId);

      if (fromAcc && toAcc && fromAcc.balance >= amount) {
        // Approximate rates for internal demo conversion
        const rateMap: Record<string, number> = {
          EUR: 1.0,
          USD: 1.08,
          GBP: 0.84,
          AED: 3.97,
          CAD: 1.48,
        };

        const fromRate = rateMap[fromAcc.currency] || 1;
        const toRate = rateMap[toAcc.currency] || 1;
        const converted = (amount / fromRate) * toRate;

        fromAcc.balance -= amount;
        fromAcc.equity -= amount;
        toAcc.balance += converted;
        toAcc.equity += converted;

        const newTx: FundTransaction = {
          id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          accountId: `${fromAccountId} -> ${toAccountId}`,
          amount,
          currency: fromAcc.currency,
          status: "Approved",
          method: "Internal Transfer",
          type: "Transfer",
          date: new Date().toISOString().replace("T", " ").substring(0, 19),
          reference: `Transferred ${amount.toFixed(2)} ${fromAcc.currency} to ${toAccountId} (received ${converted.toFixed(2)} ${toAcc.currency})`,
        };

        state.transactions.unshift(newTx);
      }
    },
    createTradingAccount: (
      state,
      action: PayloadAction<{
        category: "Live" | "Demo";
        type: "Raw ECN" | "Premium ECN";
        platform: string;
        currency: string;
        leverage: string;
        password?: string;
      }>
    ) => {
      const { category, type, platform, currency, leverage, password } =
        action.payload;
      const newId = String(Math.floor(3000011 + Math.random() * 899990));
      const flagMap: Record<string, string> = {
        USD: "🇺🇸",
        EUR: "🇪🇺",
        AUD: "🇦🇺",
        ZAR: "🇿🇦",
        CAD: "🇨🇦",
        GBP: "🇬🇧",
      };

      const newAccount: TradingAccount = {
        id: newId,
        name: `${category} ${type}`,
        currency,
        balance: category === "Demo" ? 10000.0 : 0.0,
        equity: category === "Demo" ? 10000.0 : 0.0,
        flag: flagMap[currency] || "🌐",
        server: "Lieark-Live01",
        accountCategory: category,
        type,
        platform: platform || "ActTrader",
        leverage: leverage || "500x",
        password: password || "•••••",
        createdAt: new Date().toISOString(),
      };

      state.accounts.unshift(newAccount);
      state.selectedAccountId = newId;
    },
    updateAccountLeverage: (
      state,
      action: PayloadAction<{ accountId: string; leverage: string }>
    ) => {
      const acc = state.accounts.find(
        (a) => a.id === action.payload.accountId
      );
      if (acc) {
        acc.leverage = action.payload.leverage;
      }
    },
    updateAccountPassword: (
      state,
      action: PayloadAction<{ accountId: string; password?: string }>
    ) => {
      const acc = state.accounts.find(
        (a) => a.id === action.payload.accountId
      );
      if (acc) {
        acc.password = action.payload.password || "•••••";
      }
    },
  },
});

export const {
  setSelectedAccount,
  depositFunds,
  withdrawFunds,
  internalTransfer,
  createTradingAccount,
  updateAccountLeverage,
  updateAccountPassword,
} = fundsSlice.actions;

export const selectAccounts = (state: { funds: FundsState }) => state.funds.accounts;
export const selectSelectedAccountId = (state: { funds: FundsState }) =>
  state.funds.selectedAccountId;
export const selectSelectedAccount = (state: { funds: FundsState }) =>
  state.funds.accounts.find((a) => a.id === state.funds.selectedAccountId) ||
  state.funds.accounts[0];
export const selectTransactions = (state: { funds: FundsState }) =>
  state.funds.transactions;

export default fundsSlice.reducer;

