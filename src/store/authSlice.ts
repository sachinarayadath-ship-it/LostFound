import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { TOKEN_KEY, authApi } from "@/services/api";
import type { User } from "@/types";

const USER_KEY = "lostfound.user";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
  hydrated: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => authApi.login(payload),
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }) => authApi.register(payload),
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload: Partial<User>) => authApi.updateProfile(payload),
);

const persist = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Restore session from localStorage on first client render. */
    hydrate(state) {
      state.hydrated = true;
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const raw = localStorage.getItem(USER_KEY);
        if (token && raw) {
          state.token = token;
          state.user = JSON.parse(raw) as User;
        }
      } catch {
        state.token = null;
        state.user = null;
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [login, register]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(
          thunk.fulfilled,
          (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.status = "idle";
            state.token = action.payload.token;
            state.user = action.payload.user;
            persist(action.payload.token, action.payload.user);
          },
        )
        .addCase(thunk.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.error.message ?? "Authentication failed";
        });
    }
    builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (state.token) persist(state.token, action.payload);
    });
  },
});

export const { hydrate, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
