import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "@/store/index";
import { restoreAuth } from "@/store/slices/authStore";

import "@/index.css";
import "@/styles/login.css";
import "./dashboard.css";
import "./analytics.css";
import "./funds.css";
import "./accounts.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // 1. Restore auth state on page reload from localStorage
    dispatch(restoreAuth());
    setAuthInitialized(true);
  }, [dispatch]);

  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(router.pathname.toLowerCase());

  useEffect(() => {
    if (!authInitialized) return;

    // Only redirect to login if attempting to access a protected route while unauthenticated
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/");
    }
  }, [authInitialized, isAuthenticated, isPublicRoute, router]);

  // Avoid flash of protected content while initializing auth
  if (!authInitialized) {
    return null;
  }

  // Block protected content if not authenticated
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </Provider>
  );
}
