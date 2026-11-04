import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppSelector } from "@/store/index";
import Login from "./pages/login/page";
import Dashboard from "./pages/dashboard/page";
import Analytics from "./pages/analytics/page";
import Funds from "./pages/funds/page";
import ManageAccounts from "./pages/accounts/page";

function AppRoutes() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  // If not logged in, or on "/" / "/login", always render Login page
  if (!isAuthenticated || currentPath === "/" || currentPath === "/login") {
    return <Login onLoginSuccess={() => navigateTo("/dashboard")} />;
  }

  if (currentPath === "/accounts") {
    return <ManageAccounts />;
  }
  if (currentPath === "/funds") {
    return <Funds />;
  }
  if (currentPath === "/analytics") {
    return <Analytics />;
  }
  return <Dashboard />;
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
