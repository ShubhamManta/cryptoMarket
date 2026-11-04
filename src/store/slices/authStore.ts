import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface LoginPayload {
  email?: string;
  password?: string;
  [key: string]: unknown;
}

interface UserDetails {
  userEmail: string | null;
  userPassword: string | null;
}

interface SliceState {
  value: number;
  loginUser: unknown[];
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginUsersDetails: UserDetails | null;
  userEmail: string | null;
  userPassword: string | null;
  submitedDetails: Record<string, unknown> | null;
}

const getInitialAuth = (): boolean => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("isLoggedIn") === "true";
    } catch {
      return false;
    }
  }
  return false;
};

const initialState: SliceState = {
  value: 0,
  loginUser: [],
  isAuthenticated: getInitialAuth(),
  userEmail: "mantashubham@gmail.com",
  userPassword: "Shubham@123",
  loading: false,
  error: null,
  loginUsersDetails: null,
  submitedDetails: null,
};

interface LoginResponse {
  success: boolean;
}

export const loginUsers = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>(
  "auth/loginUsers",
  async (payload, { rejectWithValue }) => {
    try {
      const data: LoginResponse = {
        success:
          initialState.userEmail === payload.email &&
          initialState.userPassword === payload.password,
      };

      return data;
    } catch (err: unknown) {
      const errorData = (
        err as { response?: { data?: string } }
      )?.response?.data;

      return rejectWithValue(errorData || "Login failed");
    }
  }
);

const storeSlice = createSlice({
  name: "slice",
  initialState,
  reducers: {
    restoreAuth: (state) => {
      if (typeof window !== "undefined") {
        try {
          const isLogged = localStorage.getItem("isLoggedIn") === "true";
          state.isAuthenticated = isLogged;
        } catch {
          state.isAuthenticated = false;
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.loginUsersDetails = null;
      state.submitedDetails = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("isLoggedIn");
        } catch {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUsers.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          state.isAuthenticated = true;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("isLoggedIn", "true");
            } catch {}
          }
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to login user";
      });
  },
});

export const { logout, restoreAuth } = storeSlice.actions;
export default storeSlice.reducer;
