import { useState } from "react";
import type { OrderType, Side } from "@/utils/types";
import { useAppDispatch, useAppSelector, getPriceBySymbol, addTrade } from "@/store/index";

interface OrderPanelProps {
  symbol?: string;
  onSubmit?: (order: {
    symbol: string;
    type: OrderType;
    lots: number;
    side: Side;
    price: string;
  }) => void;
}

const orderTypes: OrderType[] = ["Market", "Limit", "Stop"];

export default function OrderPanel({ symbol = "BTCUSDT", onSubmit }: OrderPanelProps) {
  const dispatch = useAppDispatch();
  const livePriceData = useAppSelector((state) => getPriceBySymbol(state, symbol));

  const [type, setType] = useState<OrderType>("Market");
  const [side, setSide] = useState<Side>("buy");
  const [lots, setLots] = useState<number>(0.01);
  const [userTriggerPrice, setUserTriggerPrice] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<boolean>(false);
  const [trailingStop, setTrailingStop] = useState<boolean>(false);
  const [takeProfit, setTakeProfit] = useState<boolean>(false);
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [placedFeedback, setPlacedFeedback] = useState<boolean>(false);

  // Format display symbol e.g. "ETHUSDT" -> "ETH-USD"
  const displaySymbol = symbol.endsWith("USDT")
    ? symbol.replace("USDT", "-USD")
    : symbol;

  // Live prices
  const basePrice = livePriceData?.price ? parseFloat(livePriceData.price) : 0;
  const sellPriceNum = basePrice > 0 ? basePrice : 2295.55;
  const buyPriceNum = basePrice > 0 ? basePrice * 1.0001 : 2296.55;

  const decimals = sellPriceNum < 1 ? 5 : 2;
  const sellPriceStr = sellPriceNum.toFixed(decimals);
  const buyPriceStr = buyPriceNum.toFixed(decimals);

  // Derived trigger price (default to live price with small offset if not user-edited)
  const triggerPrice =
    userTriggerPrice !== null
      ? userTriggerPrice
      : +(sellPriceNum * 1.0002).toFixed(decimals);

  const stepLots = (delta: number) => {
    setLots((v) => Math.max(0.01, +(v + delta).toFixed(2)));
  };

  const stepPrice = (deltaFactor: number) => {
    const stepVal = triggerPrice > 1000 ? 1 : triggerPrice > 10 ? 0.1 : 0.001;
    setUserTriggerPrice(+(triggerPrice + deltaFactor * stepVal).toFixed(decimals));
  };

  // Execution price based on selected side
  const activePriceStr = side === "buy" ? buyPriceStr : sellPriceStr;

  // Suffix for bottom action button: MKT, LMT, or STP
  const orderSuffix = type === "Market" ? "MKT" : type === "Limit" ? "LMT" : "STP";

  const handleOrderSubmit = () => {
    const execPrice =
      type === "Market" ? activePriceStr : triggerPrice.toFixed(decimals);
    const execNum = parseFloat(execPrice);

    const now = new Date();
    const timeStr = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(
      now.getDate()
    ).padStart(2, "0")} ${now.toTimeString().slice(0, 8)}`;

    const tradeId = `#${Math.floor(100000 + Math.random() * 900000)}`;

    const slStr = stopLoss
      ? (side === "buy" ? execNum * 0.98 : execNum * 1.02).toFixed(decimals)
      : "-";

    const tpStr = takeProfit
      ? (side === "buy" ? execNum * 1.05 : execNum * 0.95).toFixed(decimals)
      : "-";

    const tslStr = trailingStop ? "15 pts" : "-";

    const tradeItem = {
      Instrument: displaySymbol,
      Type: (side === "buy" ? "Buy" : "Sell") as "Buy" | "Sell",
      Lots: lots,
      "Open Price": execPrice,
      "Current Price": activePriceStr,
      "S/L": slStr,
      TSL: tslStr,
      TP: tpStr,
      Commission: "€0.00",
      Swap: "€0.00",
      "P/L": "€0.00",
      "Open Time": timeStr,
      "Trade Id": tradeId,
      Comment: comment.trim() || "-",
      orderType: type,
      status: (type === "Market" ? "Open" : "Pending") as "Open" | "Pending",
    };

    // Save to Redux store in cryptoSlice
    dispatch(addTrade(tradeItem));

    // Optional parent callback
    onSubmit?.({
      symbol: displaySymbol,
      type,
      lots,
      side,
      price: execPrice,
    });

    // Brief visual feedback
    setPlacedFeedback(true);
    setTimeout(() => setPlacedFeedback(false), 1200);
  };

  return (
    <aside className="panel order">
      {/* Header with Title and Info Icon */}
      <div className="order-header">
        <h2>{displaySymbol}</h2>
        <span className="order-info-icon" title="Instrument details">
          ⓘ
        </span>
      </div>

      {/* Dual SELL / BUY Quote Buttons */}
      <div className="order-sellbuy-row">
        <button
          type="button"
          className={`order-quote-btn sell ${side === "sell" ? "active" : ""}`}
          onClick={() => setSide("sell")}
        >
          SELL <span className="price-val">{sellPriceStr}</span>
        </button>
        <button
          type="button"
          className={`order-quote-btn buy ${side === "buy" ? "active" : ""}`}
          onClick={() => setSide("buy")}
        >
          BUY <span className="price-val">{buyPriceStr}</span>
        </button>
      </div>

      {/* Order Type Tabs: Market | Limit | Stop */}
      <div className="order-nav-tabs">
        {orderTypes.map((t) => (
          <button
            key={t}
            type="button"
            className={`order-nav-tab ${t === type ? "active" : ""}`}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form Fields according to selected tab */}
      <div className="order-form-body">
        {type === "Market" ? (
          /* Market Tab: Price Level (read-only live price) */
          <div className="order-field-row">
            <span className="field-label">Price Level</span>
            <div className="field-display-box">{activePriceStr}</div>
          </div>
        ) : (
          /* Limit / Stop Tabs: Trigger Price with Stepper */
          <div className="order-field-row">
            <span className="field-label">Trigger Price</span>
            <div className="field-stepper-box">
              <button
                type="button"
                className="step-btn"
                onClick={() => stepPrice(-1)}
              >
                −
              </button>
              <input
                type="number"
                step="any"
                className="stepper-input"
                value={triggerPrice}
                onChange={(e) => setUserTriggerPrice(parseFloat(e.target.value) || 0)}
              />
              <button
                type="button"
                className="step-btn"
                onClick={() => stepPrice(1)}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Quantity(Lots) with Stepper */}
        <div className="order-field-row">
          <span className="field-label">Quantity(Lots)</span>
          <div className="field-stepper-box">
            <button
              type="button"
              className="step-btn"
              onClick={() => stepLots(-0.01)}
            >
              −
            </button>
            <span className="stepper-val">{lots.toFixed(2)}</span>
            <button
              type="button"
              className="step-btn"
              onClick={() => stepLots(0.01)}
            >
              +
            </button>
          </div>
        </div>

        {/* Stop Loss Toggle */}
        <div className="order-toggle-card">
          <span>Stop Loss</span>
          <button
            type="button"
            className={`order-switch ${stopLoss ? "on" : ""}`}
            onClick={() => setStopLoss(!stopLoss)}
            aria-pressed={stopLoss}
          />
        </div>

        {/* Trailing Stop Loss Toggle */}
        <div className="order-toggle-card">
          <span>Trailing Stop Loss</span>
          <button
            type="button"
            className={`order-switch ${trailingStop ? "on" : ""}`}
            onClick={() => setTrailingStop(!trailingStop)}
            aria-pressed={trailingStop}
          />
        </div>

        {/* Take Profit Toggle */}
        <div className="order-toggle-card">
          <span>Take Profit</span>
          <button
            type="button"
            className={`order-switch ${takeProfit ? "on" : ""}`}
            onClick={() => setTakeProfit(!takeProfit)}
            aria-pressed={takeProfit}
          />
        </div>

        {/* Add Comment */}
        <div className="order-comment-wrap">
          <button
            type="button"
            className="order-comment-toggle"
            onClick={() => setShowCommentInput(!showCommentInput)}
          >
            + Add Comment
          </button>
          {showCommentInput && (
            <input
              type="text"
              className="order-comment-input"
              placeholder="Trade comment or tag..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}
        </div>

        {/* Big Action Execution Button */}
        <button
          type="button"
          className={`order-action-btn ${side === "buy" ? "buy" : "sell"} ${
            placedFeedback ? "placed" : ""
          }`}
          onClick={handleOrderSubmit}
        >
          {placedFeedback ? (
            <span className="action-main">Order Placed ✓</span>
          ) : (
            <>
              <span className="action-main">
                {side === "buy" ? "Buy" : "Sell"}
              </span>
              <span className="action-sub">
                {lots.toFixed(2)} {displaySymbol} {orderSuffix}
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
