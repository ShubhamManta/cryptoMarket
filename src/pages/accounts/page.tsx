import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Copy,
  Check,
  TrendingUp,
  CircleDollarSign,
  Eye,
  EyeOff,
  Sliders,
  KeyRound,
  ArrowRightLeft,
  X,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAppDispatch, useAppSelector } from "@/store/index";
import {
  selectAccounts,
  setSelectedAccount,
  createTradingAccount,
  updateAccountLeverage,
  updateAccountPassword,
  type TradingAccount,
} from "@/store/slices/fundsSlice";

export default function ManageAccounts() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAccounts);

  const [activeCategoryTab, setActiveCategoryTab] = useState<"Live" | "Demo">(
    "Live"
  );
  const [viewMode, setViewMode] = useState<"wide" | "compact">("wide");
  const [openMenuAccountId, setOpenMenuAccountId] = useState<string | null>(
    null
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ------------------- Create Account Wizard State ------------------- */
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);

  // Step 1 Form
  const [newAccountCategory, setNewAccountCategory] = useState<
    "Live" | "Demo"
  >("Live");
  const [newAccountTier, setNewAccountTier] = useState<
    "Raw ECN" | "Premium ECN"
  >("Raw ECN");

  // Step 2 Form
  const [newPlatform] = useState<string>("ActTrader");
  const [newCurrency, setNewCurrency] = useState<string>("USD");
  const [newLeverage, setNewLeverage] = useState<string>("500X");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  /* ------------------- Modals State ------------------- */
  // Change Leverage Modal
  const [leverageModalAccount, setLeverageModalAccount] =
    useState<TradingAccount | null>(null);
  const [selectedModalLeverage, setSelectedModalLeverage] =
    useState<string>("500x");

  // Change Password Modal
  const [passwordModalAccount, setPasswordModalAccount] =
    useState<TradingAccount | null>(null);
  const [modalNewPassword, setModalNewPassword] = useState<string>("");
  const [modalConfirmPassword, setModalConfirmPassword] = useState<string>("");
  const [showModalNewPassword, setShowModalNewPassword] =
    useState<boolean>(false);
  const [showModalConfirmPassword, setShowModalConfirmPassword] =
    useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  /* ------------------- Filtering ------------------- */
  const liveAccounts = accounts.filter(
    (acc) => acc.accountCategory === "Live" || !acc.accountCategory
  );
  const demoAccounts = accounts.filter(
    (acc) => acc.accountCategory === "Demo"
  );
  const displayedAccounts =
    activeCategoryTab === "Live" ? liveAccounts : demoAccounts;

  /* ------------------- Navigation Actions ------------------- */
  const handleBackToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleTradeClick = (acc: TradingAccount) => {
    dispatch(setSelectedAccount(acc.id));
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleDepositClick = (acc: TradingAccount) => {
    dispatch(setSelectedAccount(acc.id));
    window.history.pushState({}, "", "/funds");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleInternalTransferClick = (acc: TradingAccount) => {
    dispatch(setSelectedAccount(acc.id));
    setOpenMenuAccountId(null);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("fundsActiveTab", "Internal Transfer");
    }
    window.history.pushState({}, "", "/funds");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  /* ------------------- Create Account Submit ------------------- */
  const handleFinalSubmitAccount = () => {
    dispatch(
      createTradingAccount({
        category: newAccountCategory,
        type: newAccountTier,
        platform: newPlatform,
        currency: newCurrency,
        leverage: newLeverage.toLowerCase(),
        password: newPassword || "•••••",
      })
    );

    showToast(
      `New ${newAccountCategory} ${newAccountTier} account created successfully!`
    );
    setIsCreatingAccount(false);
    setCreateStep(1);
    setActiveCategoryTab(newAccountCategory);
    setNewPassword("");
  };

  /* ------------------- Modal Actions ------------------- */
  const handleSaveLeverage = () => {
    if (leverageModalAccount) {
      dispatch(
        updateAccountLeverage({
          accountId: leverageModalAccount.id,
          leverage: selectedModalLeverage,
        })
      );
      showToast(
        `Leverage for #${leverageModalAccount.id} updated to ${selectedModalLeverage}`
      );
      setLeverageModalAccount(null);
    }
  };

  const handleSavePassword = () => {
    setPasswordError(null);
    if (!modalNewPassword.trim()) {
      setPasswordError("Password cannot be empty.");
      return;
    }
    if (modalNewPassword !== modalConfirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (passwordModalAccount) {
      dispatch(
        updateAccountPassword({
          accountId: passwordModalAccount.id,
          password: modalNewPassword,
        })
      );
      showToast(
        `Password for account #${passwordModalAccount.id} changed successfully!`
      );
      setPasswordModalAccount(null);
      setModalNewPassword("");
      setModalConfirmPassword("");
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="body">
        <Sidebar active={3} />

        <main className="accounts-container">
          <div className="accounts-page">
            {/* Top Bar */}
            <div className="accounts-topbar">
              <button
                className="accounts-back-btn"
                onClick={() => {
                  if (isCreatingAccount) {
                    setIsCreatingAccount(false);
                    setCreateStep(1);
                  } else {
                    handleBackToDashboard();
                  }
                }}
                title="Back"
              >
                <ArrowLeft size={18} />
                <span>Manage Accounts</span>
              </button>

              {!isCreatingAccount && (
                <button
                  className="btn-add-account"
                  onClick={() => {
                    setIsCreatingAccount(true);
                    setCreateStep(1);
                  }}
                >
                  <Plus size={15} />
                  <span>Add new account</span>
                </button>
              )}
            </div>

            {/* MAIN VIEW: Accounts List */}
            {!isCreatingAccount && (
              <>
                {/* Live / Demo Tabs */}
                <div className="accounts-tabs-row">
                  <div className="accounts-tabs-left">
                    <button
                      className={`accounts-tab-btn ${
                        activeCategoryTab === "Live" ? "active" : ""
                      }`}
                      onClick={() => setActiveCategoryTab("Live")}
                    >
                      <span>Live</span>
                      <span className="accounts-count-badge">
                        {liveAccounts.length}
                      </span>
                    </button>

                    <button
                      className={`accounts-tab-btn ${
                        activeCategoryTab === "Demo" ? "active" : ""
                      }`}
                      onClick={() => setActiveCategoryTab("Demo")}
                    >
                      <span>Demo</span>
                      <span className="accounts-count-badge">
                        {demoAccounts.length}
                      </span>
                    </button>
                  </div>

                  <button
                    className="view-toggle-btn"
                    title={viewMode === "wide" ? "Switch to Grid View" : "Switch to List View"}
                    onClick={() => setViewMode(viewMode === "wide" ? "compact" : "wide")}
                  >
                    <LayoutGrid size={17} />
                  </button>
                </div>

                {/* Accounts Cards View */}
                {displayedAccounts.length === 0 ? (
                  <div className="accounts-empty-state">
                    <p>No {activeCategoryTab} trading accounts found.</p>
                    <button
                      className="card-btn-trade"
                      style={{ margin: "16px auto", width: 200 }}
                      onClick={() => {
                        setNewAccountCategory(activeCategoryTab);
                        setIsCreatingAccount(true);
                        setCreateStep(1);
                      }}
                    >
                      + Create {activeCategoryTab} Account
                    </button>
                  </div>
                ) : viewMode === "wide" ? (
                  /* Wide Horizontal Cards Layout (Screenshot Match) */
                  <div className="accounts-wide-list">
                    {displayedAccounts.map((acc) => (
                      <div key={acc.id} className="account-wide-card">
                        {/* Top Header */}
                        <div className="account-wide-top">
                          <div className="account-wide-title">
                            <span className="account-crest-icon">🛡️</span>
                            <span>{acc.id}</span>
                          </div>

                          <div className="account-wide-actions">
                            <button
                              className="card-btn-trade-wide"
                              onClick={() => handleTradeClick(acc)}
                            >
                              <TrendingUp size={14} />
                              <span>Trade</span>
                            </button>

                            <button
                              className="card-btn-deposit-wide"
                              onClick={() => handleDepositClick(acc)}
                            >
                              <CircleDollarSign size={14} />
                              <span>Deposit</span>
                            </button>

                            <div style={{ position: "relative" }}>
                              <button
                                className="account-dots-btn"
                                onClick={() =>
                                  setOpenMenuAccountId(
                                    openMenuAccountId === acc.id ? null : acc.id
                                  )
                                }
                                title="Account Options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* 3 Dots Popover Dropdown */}
                              {openMenuAccountId === acc.id && (
                                <div className="account-actions-dropdown">
                                  <button
                                    className="account-action-item"
                                    onClick={() => {
                                      setLeverageModalAccount(acc);
                                      setSelectedModalLeverage(
                                        acc.leverage || "500x"
                                      );
                                      setOpenMenuAccountId(null);
                                    }}
                                  >
                                    <Sliders size={14} color="#3ddc84" />
                                    <span>Change Leverage</span>
                                  </button>

                                  <button
                                    className="account-action-item"
                                    onClick={() => {
                                      setPasswordModalAccount(acc);
                                      setModalNewPassword("");
                                      setModalConfirmPassword("");
                                      setPasswordError(null);
                                      setOpenMenuAccountId(null);
                                    }}
                                  >
                                    <KeyRound size={14} color="#f5a623" />
                                    <span>Change Password</span>
                                  </button>

                                  <button
                                    className="account-action-item"
                                    onClick={() => handleInternalTransferClick(acc)}
                                  >
                                    <ArrowRightLeft size={14} color="#38bdf8" />
                                    <span>Internal Transfer</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Data Strip (3 Columns) */}
                        <div className="account-wide-strip">
                          <div className="account-strip-item">
                            <span className="account-strip-label">Trading ID</span>
                            <div className="account-strip-val">
                              <span>{acc.id}</span>
                              <button
                                className="account-copy-icon-btn"
                                onClick={() => handleCopy(acc.id, acc.id)}
                                title="Copy Trading ID"
                              >
                                {copiedId === acc.id ? (
                                  <Check size={13} color="#3ddc84" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="account-strip-item">
                            <span className="account-strip-label">Password</span>
                            <span className="account-strip-val">*****</span>
                          </div>

                          <div className="account-strip-item">
                            <span className="account-strip-label">Base Currency</span>
                            <span className="account-strip-val">{acc.currency}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Compact Multi-Column Grid Layout */
                  <div className="accounts-grid">
                    {displayedAccounts.map((acc) => (
                      <div key={acc.id} className="account-card">
                        {/* Header */}
                        <div className="account-card-header">
                          <div className="account-card-title">
                            <span className="account-crest-icon">🛡️</span>
                            <span>{acc.id}</span>
                            <span style={{ fontSize: 14 }}>{acc.flag}</span>
                          </div>

                          <button
                            className="account-dots-btn"
                            onClick={() =>
                              setOpenMenuAccountId(
                                openMenuAccountId === acc.id ? null : acc.id
                              )
                            }
                            title="Account Options"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* 3 Dots Popover Dropdown */}
                          {openMenuAccountId === acc.id && (
                            <div className="account-actions-dropdown">
                              <button
                                className="account-action-item"
                                onClick={() => {
                                  setLeverageModalAccount(acc);
                                  setSelectedModalLeverage(
                                    acc.leverage || "500x"
                                  );
                                  setOpenMenuAccountId(null);
                                }}
                              >
                                <Sliders size={14} color="#3ddc84" />
                                <span>Change Leverage</span>
                              </button>

                              <button
                                className="account-action-item"
                                onClick={() => {
                                  setPasswordModalAccount(acc);
                                  setModalNewPassword("");
                                  setModalConfirmPassword("");
                                  setPasswordError(null);
                                  setOpenMenuAccountId(null);
                                }}
                              >
                                <KeyRound size={14} color="#f5a623" />
                                <span>Change Password</span>
                              </button>

                              <button
                                className="account-action-item"
                                onClick={() => handleInternalTransferClick(acc)}
                              >
                                <ArrowRightLeft size={14} color="#38bdf8" />
                                <span>Internal Transfer</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Body Details */}
                        <div className="account-card-body">
                          <div className="account-data-row">
                            <span className="account-row-label">Trading ID</span>
                            <div className="account-id-copy">
                              <span>{acc.id}</span>
                              <button
                                className="account-copy-icon-btn"
                                onClick={() => handleCopy(acc.id, acc.id)}
                                title="Copy Trading ID"
                              >
                                {copiedId === acc.id ? (
                                  <Check size={13} color="#3ddc84" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="account-data-row">
                            <span className="account-row-label">Password</span>
                            <span className="account-row-val">*****</span>
                          </div>

                          <div className="account-data-row">
                            <span className="account-row-label">
                              Base Currency
                            </span>
                            <span className="account-row-val">
                              {acc.currency}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="account-card-actions">
                          <button
                            className="card-btn-trade"
                            onClick={() => handleTradeClick(acc)}
                          >
                            <TrendingUp size={14} />
                            <span>Trade</span>
                          </button>

                          <button
                            className="card-btn-deposit"
                            onClick={() => handleDepositClick(acc)}
                          >
                            <CircleDollarSign size={14} />
                            <span>Deposit</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CREATE ACCOUNT FLOW */}
            {isCreatingAccount && (
              <div className="create-account-container">
                {/* STEP 1: Select Trading Account */}
                {createStep === 1 && (
                  <>
                    <h2 className="create-account-title">
                      Select Trading Account
                    </h2>

                    {/* Live / Demo Radio Toggle */}
                    <div className="category-toggle-pill">
                      <button
                        className={`category-radio-btn ${
                          newAccountCategory === "Live" ? "active" : ""
                        }`}
                        onClick={() => setNewAccountCategory("Live")}
                      >
                        <span className="radio-circle">
                          {newAccountCategory === "Live" && (
                            <span className="radio-circle-inner" />
                          )}
                        </span>
                        <span>Live Account</span>
                      </button>

                      <button
                        className={`category-radio-btn ${
                          newAccountCategory === "Demo" ? "active" : ""
                        }`}
                        onClick={() => setNewAccountCategory("Demo")}
                      >
                        <span className="radio-circle">
                          {newAccountCategory === "Demo" && (
                            <span className="radio-circle-inner" />
                          )}
                        </span>
                        <span>Demo Account</span>
                      </button>
                    </div>

                    {/* Tier Selection Cards */}
                    <div className="tiers-grid">
                      {/* Card 1: Raw ECN */}
                      <div
                        className={`tier-card ${
                          newAccountTier === "Raw ECN" ? "selected" : ""
                        }`}
                        onClick={() => setNewAccountTier("Raw ECN")}
                      >
                        <div className="tier-name">Raw ECN</div>
                        <div className="tier-sub">Account</div>

                        <div className="tier-row">
                          <span>Minimum Deposit</span>
                          <b>$50</b>
                        </div>
                        <div className="tier-row">
                          <span>Spreads</span>
                          <b>From 0.0 Pips</b>
                        </div>
                        <div className="tier-row">
                          <span>Commission</span>
                          <b>$2/100k per side</b>
                        </div>
                      </div>

                      {/* Card 2: Premium ECN */}
                      <div
                        className={`tier-card ${
                          newAccountTier === "Premium ECN" ? "selected" : ""
                        }`}
                        onClick={() => setNewAccountTier("Premium ECN")}
                      >
                        <div className="tier-name">Premium ECN</div>
                        <div className="tier-sub">Account</div>

                        <div className="tier-row">
                          <span>Minimum Deposit</span>
                          <b>$5000</b>
                        </div>
                        <div className="tier-row">
                          <span>Spreads</span>
                          <b>From 0.0 Pips</b>
                        </div>
                        <div className="tier-row">
                          <span>Commission</span>
                          <b>$1/100k per side</b>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-proceed"
                      style={{ width: 220 }}
                      onClick={() => setCreateStep(2)}
                    >
                      Continue
                    </button>
                  </>
                )}

                {/* STEP 2: Configure Platform, Currency, Leverage, Password */}
                {createStep === 2 && (
                  <div className="create-form-box">
                    <h2
                      className="create-account-title"
                      style={{ marginBottom: 16 }}
                    >
                      Create {newAccountCategory} Account
                    </h2>

                    {/* Platform */}
                    <div>
                      <label className="field-label">Platform</label>
                      <div className="platform-pill">
                        <span className="radio-circle">
                          <span className="radio-circle-inner" />
                        </span>
                        <span>ActTrader</span>
                      </div>
                    </div>

                    {/* Currency Type */}
                    <div>
                      <label className="field-label">Currency Type</label>
                      <div className="currency-chips-row">
                        {[
                          { code: "USD", flag: "🇺🇸" },
                          { code: "EUR", flag: "🇪🇺" },
                          { code: "AUD", flag: "🇦🇺" },
                          { code: "ZAR", flag: "🇿🇦" },
                          { code: "CAD", flag: "🇨🇦" },
                        ].map((c) => (
                          <button
                            key={c.code}
                            className={`currency-chip-btn ${
                              newCurrency === c.code ? "selected" : ""
                            }`}
                            onClick={() => setNewCurrency(c.code)}
                          >
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select Leverage */}
                    <div>
                      <label className="field-label">Select Leverage</label>
                      <div className="leverage-chips-row">
                        {[
                          "100X",
                          "200X",
                          "300X",
                          "400X",
                          "500X",
                          "1000X",
                        ].map((lev) => (
                          <button
                            key={lev}
                            className={`leverage-chip-btn ${
                              newLeverage === lev ? "selected" : ""
                            }`}
                            onClick={() => setNewLeverage(lev)}
                          >
                            {lev}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="field-label">Password</label>
                      <div className="password-input-wrap">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="password-eye-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="btn-actions-row" style={{ marginTop: 12 }}>
                      <button
                        className="btn-cancel"
                        onClick={() => setCreateStep(1)}
                      >
                        Back
                      </button>
                      <button
                        className="btn-proceed"
                        onClick={handleFinalSubmitAccount}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==================== MODAL 1: CHANGE LEVERAGE ==================== */}
      {leverageModalAccount && (
        <div className="accounts-modal-backdrop">
          <div className="accounts-modal-box">
            <div className="modal-header">
              <span className="modal-title">Change Leverage</span>
              <button
                className="modal-close-btn"
                onClick={() => setLeverageModalAccount(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-account-pill">
              <span>{leverageModalAccount.id}</span>
              <span style={{ fontSize: 12, color: "#8d9097" }}>▾</span>
            </div>

            <label className="field-label" style={{ marginBottom: 12 }}>
              Select Leverage
            </label>
            <div className="leverage-chips-row" style={{ marginBottom: 24 }}>
              {["100x", "200x", "300x", "400x", "500x", "1000x"].map((lev) => (
                <button
                  key={lev}
                  className={`leverage-chip-btn ${
                    selectedModalLeverage.toLowerCase() === lev ? "selected" : ""
                  }`}
                  onClick={() => setSelectedModalLeverage(lev)}
                >
                  {lev}
                </button>
              ))}
            </div>

            <div className="btn-actions-row">
              <button
                className="btn-cancel"
                onClick={() => setLeverageModalAccount(null)}
              >
                Cancel
              </button>
              <button className="btn-proceed" onClick={handleSaveLeverage}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: CHANGE PASSWORD ==================== */}
      {passwordModalAccount && (
        <div className="accounts-modal-backdrop">
          <div className="accounts-modal-box">
            <div className="modal-header">
              <span className="modal-title">Change Password</span>
              <button
                className="modal-close-btn"
                onClick={() => setPasswordModalAccount(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-account-pill">
              <span>🛡️ Account Id:</span>
              <span>{passwordModalAccount.id}</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label">New Password</label>
              <div className="password-input-wrap">
                <input
                  type={showModalNewPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={modalNewPassword}
                  onChange={(e) => setModalNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowModalNewPassword(!showModalNewPassword)}
                >
                  {showModalNewPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Confirm Password</label>
              <div className="password-input-wrap">
                <input
                  type={showModalConfirmPassword ? "text" : "password"}
                  placeholder="Enter Confirm Password"
                  value={modalConfirmPassword}
                  onChange={(e) => setModalConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() =>
                    setShowModalConfirmPassword(!showModalConfirmPassword)
                  }
                >
                  {showModalConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {passwordError && (
              <div
                style={{
                  color: "#d8454f",
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                {passwordError}
              </div>
            )}

            <div className="btn-actions-row">
              <button
                className="btn-cancel"
                onClick={() => setPasswordModalAccount(null)}
              >
                Cancel
              </button>
              <button className="btn-proceed" onClick={handleSavePassword}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="funds-toast">
          <CheckCircle2 size={18} className="funds-toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
