
import { Provider } from "react-redux";
import Dashboard from "./pages/Dashboard";
import { store } from "./store/store";
import MarketSocket from "./store/services/MarketSocket";

function App() {
  return (
    <Provider store={store}>
      <MarketSocket />
      <Dashboard />
    </Provider>
  );
}

export default App;
