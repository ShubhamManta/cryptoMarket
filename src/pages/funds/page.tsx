import { useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Check,
  ShieldCheck,
  ArrowRightLeft,
  Search,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Lock,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAppDispatch, useAppSelector } from "@/store/index";
import {
  selectAccounts,
  selectSelectedAccountId,
  selectTransactions,
  setSelectedAccount,
  depositFunds,
  withdrawFunds,
  internalTransfer,
  BANK_DETAILS_BY_CURRENCY,
  type FundTransaction,
} from "@/store/slices/fundsSlice";

type TabType =
  | "Deposit"
  | "Withdrawal"
  | "Wallets"
  | "Internal Transfer"
  | "Transaction History";

type DepositMethodType = "Bank" | "Crypto" | "Mastercard/Visa";

export default function Funds() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAccounts);
  const selectedAccountId = useAppSelector(selectSelectedAccountId);
  const transactions = useAppSelector(selectTransactions);

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("fundsActiveTab")
        : null;
    if (saved) {
      sessionStorage.removeItem("fundsActiveTab");
      return saved as TabType;
    }
    return "Deposit";
  });
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /* ------------------- 1. Deposit State ------------------- */
  const [depositMethod, setDepositMethod] = useState<DepositMethodType>("Bank");

  // Bank Deposit
  const [bankCurrency, setBankCurrency] = useState<string>("USD");
  const bankDetails =
    BANK_DETAILS_BY_CURRENCY[bankCurrency] || BANK_DETAILS_BY_CURRENCY["USD"];

  // Crypto Deposit
  const [cryptoAsset, setCryptoAsset] = useState<string>("BTC");
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState<string>("");
  const [cryptoAddressError, setCryptoAddressError] = useState<boolean>(false);
  const [cryptoConfirmed, setCryptoConfirmed] = useState<boolean>(false);
  const [cryptoAmount, setCryptoAmount] = useState<string>("100");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("EUR");

  // Card Deposit
  const [cardAmount, setCardAmount] = useState<string>("150");
  const [cardCurrency, setCardCurrency] = useState<string>("EUR");
  const [cardNumber, setCardNumber] = useState<string>("4532 •••• •••• 8912");

  /* ------------------- 2. Withdrawal State ------------------- */
  const [withdrawSourceId, setWithdrawSourceId] = useState<string>(
    selectedAccountId
  );
  const [withdrawMethod, setWithdrawMethod] = useState<"Bank" | "Crypto">(
    "Bank"
  );
  const [withdrawAmount, setWithdrawAmount] = useState<string>("500");
  const [withdrawDestination, setWithdrawDestination] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const withdrawSourceAccount =
    accounts.find((a) => a.id === withdrawSourceId) || selectedAccount;

  /* ------------------- 3. Internal Transfer State ------------------- */
  const [transferFromId, setTransferFromId] = useState<string>(
    selectedAccountId
  );
  const [transferToId, setTransferToId] = useState<string>(
    accounts.find((a) => a.id !== selectedAccountId)?.id || accounts[1]?.id || ""
  );
  const [transferAmount, setTransferAmount] = useState<string>("250");
  const [transferError, setTransferError] = useState<string | null>(null);

  const transferFromAcc =
    accounts.find((a) => a.id === transferFromId) || accounts[0];
  const transferToAcc =
    accounts.find((a) => a.id === transferToId) || accounts[1];

  /* ------------------- 4. History Filter State ------------------- */
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("All");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("All");
  const [historySearch, setHistorySearch] = useState<string>("");

  /* ------------------- Navigation Helpers ------------------- */
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  /* ------------------- Action Handlers ------------------- */
  const handleProceedCryptoDeposit = () => {
    if (!cryptoWalletAddress.trim()) {
      setCryptoAddressError(true);
      return;
    }
    setCryptoAddressError(false);

    const amt = parseFloat(cryptoAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid deposit amount.");
      return;
    }

    dispatch(
      depositFunds({
        accountId: selectedAccount.id,
        amount: amt,
        currency: cryptoCurrency,
        method: "Crypto",
        walletOrIban: cryptoWalletAddress,
        reference: `${cryptoAsset} deposit from ${cryptoWalletAddress.substring(
          0,
          10
        )}...`,
      })
    );

    showToast(
      `Deposit of ${amt} ${cryptoCurrency} via ${cryptoAsset} initiated successfully!`
    );
    setCryptoWalletAddress("");
  };

  const handleProceedCardDeposit = () => {
    const amt = parseFloat(cardAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid deposit amount.");
      return;
    }

    dispatch(
      depositFunds({
        accountId: selectedAccount.id,
        amount: amt,
        currency: cardCurrency,
        method: "Mastercard/Visa",
        walletOrIban: `Card *${cardNumber.slice(-4)}`,
        reference: `Card payment authorization #${Math.floor(
          100000 + Math.random() * 900000
        )}`,
      })
    );

    showToast(
      `Deposit of ${amt} ${cardCurrency} via Card approved and credited!`
    );
  };

  const handleSimulateBankDeposit = () => {
    const defaultAmt = bankCurrency === "AED" ? 1850 : 500;
    dispatch(
      depositFunds({
        accountId: selectedAccount.id,
        amount: defaultAmt,
        currency: bankCurrency,
        method: "Bank",
        walletOrIban: bankDetails.iban,
        reference: `For trading account ${selectedAccount.id}`,
      })
    );
    showToast(
      `Bank wire transfer notice of ${defaultAmt} ${bankCurrency} recorded. Status: Pending.`
    );
  };

  const handleRequestWithdrawal = () => {
    setWithdrawError(null);
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount.");
      return;
    }
    if (amt > withdrawSourceAccount.balance) {
      setWithdrawError(
        `Insufficient balance. Maximum available: ${withdrawSourceAccount.currency} ${withdrawSourceAccount.balance.toFixed(
          2
        )}`
      );
      return;
    }
    if (!withdrawDestination.trim()) {
      setWithdrawError(
        withdrawMethod === "Bank"
          ? "Please provide your beneficiary IBAN / Account Number."
          : "Please provide your destination crypto wallet address."
      );
      return;
    }

    dispatch(
      withdrawFunds({
        accountId: withdrawSourceAccount.id,
        amount: amt,
        currency: withdrawSourceAccount.currency,
        method: withdrawMethod === "Bank" ? "Bank" : "Crypto",
        destination: withdrawDestination,
      })
    );

    showToast(
      `Withdrawal request for ${withdrawSourceAccount.currency} ${amt.toFixed(
        2
      )} submitted.`
    );
    setWithdrawDestination("");
  };

  const handleTransfer = () => {
    setTransferError(null);
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError("Please enter a valid transfer amount.");
      return;
    }
    if (transferFromId === transferToId) {
      setTransferError("Source and destination accounts must be different.");
      return;
    }
    if (amt > transferFromAcc.balance) {
      setTransferError(
        `Insufficient funds in account ${transferFromAcc.id}. Balance: ${transferFromAcc.currency} ${transferFromAcc.balance.toFixed(
          2
        )}`
      );
      return;
    }

    dispatch(
      internalTransfer({
        fromAccountId: transferFromId,
        toAccountId: transferToId,
        amount: amt,
      })
    );

    showToast(
      `Transferred ${amt.toFixed(2)} ${transferFromAcc.currency} from #${transferFromAcc.id} to #${transferToId}`
    );
  };

  const handleSwapTransferAccounts = () => {
    const temp = transferFromId;
    setTransferFromId(transferToId);
    setTransferToId(temp);
  };

  /* ------------------- Filtered Transactions ------------------- */
  const filteredTransactions = transactions.filter((tx) => {
    if (historyTypeFilter !== "All" && tx.type !== historyTypeFilter) {
      return false;
    }
    if (historyStatusFilter !== "All" && tx.status !== historyStatusFilter) {
      return false;
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchId = tx.id.toLowerCase().includes(q);
      const matchAcc = tx.accountId.toLowerCase().includes(q);
      const matchMethod = tx.method.toLowerCase().includes(q);
      const matchCurrency = tx.currency.toLowerCase().includes(q);
      return matchId || matchAcc || matchMethod || matchCurrency;
    }
    return true;
  });

  return (
    <div className="app">
      <Header />
      <div className="body">
        <Sidebar active={2} />

        <main className="funds-container">
          <div className="funds-page">
            {/* Top Bar with Back Arrow */}
            <div className="funds-topbar">
              <button
                className="funds-back-btn"
                onClick={handleBackToDashboard}
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} />
                <span>Manage Funds</span>
              </button>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="funds-tabs">
              {(
                [
                  "Deposit",
                  "Withdrawal",
                  "Wallets",
                  "Internal Transfer",
                  "Transaction History",
                ] as TabType[]
              ).map((tab) => (
                <button
                  key={tab}
                  className={`funds-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: DEPOSIT */}
            {activeTab === "Deposit" && (
              <div className="deposit-section">
                {/* Account Selection Full-Width Header Bar */}
                <div className="funds-account-bar">
                  <div className="funds-account-left">
                    <span className="funds-account-label">Deposit Funds to:</span>
                    <div className="funds-account-dropdown-wrapper">
                      <button
                        className="funds-account-btn"
                        onClick={() =>
                          setAccountDropdownOpen(!accountDropdownOpen)
                        }
                      >
                        <span className="account-crest">🛡️</span>
                        <span>{selectedAccount.id}</span>
                        <span className="account-flag">{selectedAccount.flag}</span>
                        <ChevronDown size={14} className="account-chevron" />
                      </button>

                      {accountDropdownOpen && (
                        <div className="funds-account-menu">
                          {accounts.map((acc) => (
                            <button
                              key={acc.id}
                              className={`funds-account-item ${
                                acc.id === selectedAccount.id ? "active" : ""
                              }`}
                              onClick={() => {
                                dispatch(setSelectedAccount(acc.id));
                                setAccountDropdownOpen(false);
                              }}
                            >
                              <div className="acc-item-left">
                                <span>🛡️</span>
                                <span>{acc.id}</span>
                                <span>{acc.flag}</span>
                              </div>
                              <span className="acc-item-balance">
                                {acc.currency}{" "}
                                {acc.balance.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="funds-account-meta">
                    <span className="account-live-chip">LIVE ACCOUNT</span>
                    <span>
                      Balance:{" "}
                      <b>
                        {selectedAccount.currency}{" "}
                        {selectedAccount.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </b>
                    </span>
                    <span>
                      Server: <b>{selectedAccount.server}</b>
                    </span>
                  </div>
                </div>

                {/* 3-Column Balanced Layout */}
                <div className="funds-deposit-layout">
                  {/* Column 1: Payment Methods */}
                  <div className="methods-col">
                    {/* Bank Method */}
                    <div
                      className={`method-card ${
                        depositMethod === "Bank" ? "active" : ""
                      }`}
                      onClick={() => setDepositMethod("Bank")}
                    >
                      <span className="method-title">Bank</span>
                      <div className="method-icon-wrap">
                        <span className="bank-icon-badge">BANK TRANSFER</span>
                      </div>
                    </div>

                    {/* Crypto Method */}
                    <div
                      className={`method-card ${
                        depositMethod === "Crypto" ? "active" : ""
                      }`}
                      onClick={() => setDepositMethod("Crypto")}
                    >
                      <span className="method-title">Crypto</span>
                      <div className="crypto-icon-badge">₿</div>
                    </div>

                    {/* Mastercard/Visa Method */}
                    <div
                      className={`method-card ${
                        depositMethod === "Mastercard/Visa" ? "active" : ""
                      }`}
                      onClick={() => setDepositMethod("Mastercard/Visa")}
                    >
                      <span className="method-title">Mastercard/Visa</span>
                      <div className="card-logos">
                        <span className="visa-badge">VISA</span>
                        <div className="mc-badge">
                          <span className="mc-circle-red" />
                          <span className="mc-circle-yellow" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Method Specific Details Form */}
                  <div className="details-col">
                    {/* BANK DETAILS */}
                    {depositMethod === "Bank" && (
                      <div>
                        <div className="form-group">
                          <label className="form-label">Select Currency</label>
                          <select
                            className="funds-select"
                            value={bankCurrency}
                            onChange={(e) => setBankCurrency(e.target.value)}
                          >
                            <option value="USD">USD</option>
                            <option value="AED">AED</option>
                            <option value="EUR">EUR</option>
                            <option value="CAD">CAD</option>
                          </select>
                        </div>

                        {/* Bank Details Box with 2-Column Data Grid */}
                        <div className="bank-info-box">
                          <div className="bank-info-header">
                            <span>{bankDetails.bankName}</span>
                            <span style={{ fontSize: 12, color: "#8d9097", fontWeight: 500 }}>
                              Currency: {bankCurrency}
                            </span>
                          </div>

                          <div className="bank-grid-details">
                            <div className="bank-item-block">
                              <div className="bank-item-label">
                                Minimum Deposit Amount
                              </div>
                              <div className="bank-item-val highlight">
                                {bankDetails.minimumDeposit}
                              </div>
                            </div>

                            <div className="bank-item-block">
                              <div className="bank-item-label">Holder Name</div>
                              <div className="bank-item-val">
                                {bankDetails.holderName}
                              </div>
                            </div>

                            <div className="bank-item-block">
                              <div className="bank-item-label">Account Number</div>
                              <div className="bank-item-val">
                                <span>{bankDetails.accountNumber}</span>
                                <button
                                  className="bank-copy-btn"
                                  onClick={() =>
                                    handleCopy(
                                      bankDetails.accountNumber,
                                      "Account Number"
                                    )
                                  }
                                  title="Copy Account Number"
                                >
                                  {copiedKey === "Account Number" ? (
                                    <Check size={13} color="#3ddc84" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="bank-item-block">
                              <div className="bank-item-label">Swift/BIC</div>
                              <div className="bank-item-val">
                                <span>{bankDetails.swiftBic}</span>
                                <button
                                  className="bank-copy-btn"
                                  onClick={() =>
                                    handleCopy(bankDetails.swiftBic, "Swift/BIC")
                                  }
                                  title="Copy Swift/BIC"
                                >
                                  {copiedKey === "Swift/BIC" ? (
                                    <Check size={13} color="#3ddc84" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="bank-item-block" style={{ gridColumn: "1 / -1" }}>
                              <div className="bank-item-label">IBAN</div>
                              <div className="bank-item-val">
                                <span>{bankDetails.iban}</span>
                                <button
                                  className="bank-copy-btn"
                                  onClick={() =>
                                    handleCopy(bankDetails.iban, "IBAN")
                                  }
                                  title="Copy IBAN"
                                >
                                  {copiedKey === "IBAN" ? (
                                    <Check size={13} color="#3ddc84" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>

                            {bankDetails.sortCode && (
                              <div className="bank-item-block">
                                <div className="bank-item-label">Sort Code</div>
                                <div className="bank-item-val">
                                  {bankDetails.sortCode}
                                </div>
                              </div>
                            )}

                            {bankDetails.transitNumber && (
                              <div className="bank-item-block">
                                <div className="bank-item-label">
                                  Transit Number
                                </div>
                                <div className="bank-item-val">
                                  {bankDetails.transitNumber}
                                </div>
                              </div>
                            )}

                            <div className="bank-item-block" style={{ gridColumn: "1 / -1" }}>
                              <div className="bank-item-label">Bank Address</div>
                              <div className="bank-item-val">
                                {bankDetails.address}
                              </div>
                            </div>

                            <div className="bank-item-block" style={{ gridColumn: "1 / -1" }}>
                              <div className="bank-item-label">Reference (Mandatory)</div>
                              <div className="bank-item-val">
                                <b style={{ color: "#3ddc84" }}>
                                  For trading account {selectedAccount.id}
                                </b>
                                <button
                                  className="bank-copy-btn"
                                  onClick={() =>
                                    handleCopy(
                                      `For trading account ${selectedAccount.id}`,
                                      "Reference"
                                    )
                                  }
                                  title="Copy Reference"
                                >
                                  {copiedKey === "Reference" ? (
                                    <Check size={13} color="#3ddc84" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Processing Footer */}
                        <div className="funds-footer-meta">
                          <span>Processing time: 1 to 5 working days</span>
                          <span>No Fee</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 18,
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div className="secure-badge">
                            <ShieldCheck size={14} />
                            <span>The connection is secure</span>
                          </div>

                          <button
                            className="btn-cancel"
                            style={{ flex: "none", padding: "8px 18px" }}
                            onClick={handleSimulateBankDeposit}
                          >
                            + Record Wire Notice
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CRYPTO DETAILS */}
                    {depositMethod === "Crypto" && (
                      <div>
                        {/* Select Asset */}
                        <div className="form-group">
                          <label className="form-label">Select Cryptocurrency</label>
                          <select
                            className="funds-select"
                            value={cryptoAsset}
                            onChange={(e) => setCryptoAsset(e.target.value)}
                          >
                            <option value="BTC">BTC (Bitcoin)</option>
                            <option value="UGOLD">UGOLD (Universal Gold)</option>
                            <option value="USDT(ERC20)">USDT (ERC-20)</option>
                            <option value="ETH(ERC20)">ETH (ERC-20)</option>
                            <option value="USDT(TRC20)">USDT (TRC-20)</option>
                            <option value="SOL">SOL (Solana)</option>
                          </select>
                        </div>

                        {/* Wallet Address Input */}
                        <div className="form-group">
                          <label className="form-label">Wallet Address</label>
                          <input
                            type="text"
                            className={`funds-input ${
                              cryptoAddressError ? "input-error" : ""
                            }`}
                            placeholder="Wallet address"
                            value={cryptoWalletAddress}
                            onChange={(e) => {
                              setCryptoWalletAddress(e.target.value);
                              if (e.target.value.trim()) {
                                setCryptoAddressError(false);
                              }
                            }}
                          />
                          {cryptoAddressError && (
                            <div className="error-text">Address is required</div>
                          )}
                        </div>

                        {/* Confirmation Checkbox */}
                        <label className="checkbox-row">
                          <input
                            type="checkbox"
                            checked={cryptoConfirmed}
                            onChange={(e) => setCryptoConfirmed(e.target.checked)}
                          />
                          <span>
                            I confirm, that the Crypto wallet address mentioned
                            above, solely belongs to me. I understand and I agree,
                            that future withdrawals transactions will be available
                            only to this Crypto wallet address.
                          </span>
                        </label>

                        {/* Deposit Amount */}
                        <div className="form-group">
                          <label className="form-label">Deposit Amount</label>
                          <div className="amount-input-group">
                            <input
                              type="number"
                              className="funds-input"
                              value={cryptoAmount}
                              onChange={(e) => setCryptoAmount(e.target.value)}
                              placeholder="0"
                              min="50"
                            />
                            <select
                              className="currency-select"
                              value={cryptoCurrency}
                              onChange={(e) => setCryptoCurrency(e.target.value)}
                            >
                              <option value="EUR">EUR</option>
                              <option value="USD">USD</option>
                              <option value="GBP">GBP</option>
                              <option value="AED">AED</option>
                            </select>
                          </div>
                          <div className="limit-hint">
                            50 - ∞ {cryptoCurrency}
                          </div>
                        </div>

                        {/* Terms link */}
                        <div className="terms-line">
                          You agree to <span>"Terms for Crypto Payment"</span>
                        </div>

                        {/* Buttons */}
                        <div className="btn-actions-row">
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              setCryptoWalletAddress("");
                              setCryptoAddressError(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-proceed"
                            disabled={!cryptoConfirmed}
                            onClick={handleProceedCryptoDeposit}
                          >
                            Proceed
                          </button>
                        </div>

                        {/* Processing Footer */}
                        <div className="funds-footer-meta">
                          <span>Processing time: Instant</span>
                          <span>No Fee</span>
                        </div>
                      </div>
                    )}

                    {/* MASTERCARD / VISA DETAILS */}
                    {depositMethod === "Mastercard/Visa" && (
                      <div>
                        <div className="form-group">
                          <label className="form-label">Deposit Amount</label>
                          <div className="amount-input-group">
                            <input
                              type="number"
                              className="funds-input"
                              value={cardAmount}
                              onChange={(e) => setCardAmount(e.target.value)}
                              placeholder="0"
                              min="50"
                            />
                            <select
                              className="currency-select"
                              value={cardCurrency}
                              onChange={(e) => setCardCurrency(e.target.value)}
                            >
                              <option value="EUR">EUR</option>
                              <option value="USD">USD</option>
                              <option value="GBP">GBP</option>
                              <option value="CAD">CAD</option>
                            </select>
                          </div>
                          <div className="limit-hint">50 - ∞ {cardCurrency}</div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Card Number</label>
                          <input
                            type="text"
                            className="funds-input"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 0000 0000 0000"
                          />
                        </div>

                        <div className="card-fields-grid">
                          <div className="form-group">
                            <label className="form-label">Expiry Date</label>
                            <input
                              type="text"
                              className="funds-input"
                              placeholder="MM/YY"
                              defaultValue="12/28"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">CVV / CVC</label>
                            <input
                              type="password"
                              className="funds-input"
                              placeholder="•••"
                              defaultValue="342"
                              maxLength={4}
                            />
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="btn-actions-row">
                          <button
                            className="btn-cancel"
                            onClick={() => setCardAmount("150")}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-proceed"
                            onClick={handleProceedCardDeposit}
                          >
                            Proceed
                          </button>
                        </div>

                        {/* Processing Footer */}
                        <div className="funds-footer-meta">
                          <span>Processing time: 1 to 5 working days</span>
                          <span>No Fee</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Account & Funding Summary Panel */}
                  <div className="deposit-summary-col">
                    <div className="summary-card">
                      <div className="summary-card-title">
                        <span>Account Summary</span>
                        <span style={{ fontSize: 16 }}>{selectedAccount.flag}</span>
                      </div>
                      <div className="summary-stat-row">
                        <span>Account Number</span>
                        <b>#{selectedAccount.id}</b>
                      </div>
                      <div className="summary-stat-row">
                        <span>Type</span>
                        <b>{selectedAccount.type}</b>
                      </div>
                      <div className="summary-stat-row">
                        <span>Balance</span>
                        <b className="green">
                          {selectedAccount.currency}{" "}
                          {selectedAccount.balance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </b>
                      </div>
                      <div className="summary-stat-row">
                        <span>Equity</span>
                        <b>
                          {selectedAccount.currency}{" "}
                          {selectedAccount.equity.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </b>
                      </div>
                      <div className="summary-stat-row">
                        <span>Trading Server</span>
                        <b>{selectedAccount.server}</b>
                      </div>
                      <div className="summary-stat-row">
                        <span>Leverage</span>
                        <b>1:500</b>
                      </div>
                    </div>

                    <div className="summary-card">
                      <div className="summary-card-title">
                        <span>Funding Highlights</span>
                        <Zap size={15} color="#3ddc84" />
                      </div>
                      <div className="funding-perk-item">
                        <CheckCircle2 size={14} className="perk-icon-check" />
                        <span>Instant settlement on Crypto & Card deposits</span>
                      </div>
                      <div className="funding-perk-item">
                        <CheckCircle2 size={14} className="perk-icon-check" />
                        <span>0% commission and zero deposit handling fees</span>
                      </div>
                      <div className="funding-perk-item">
                        <CheckCircle2 size={14} className="perk-icon-check" />
                        <span>Client funds held in Segregated Tier-1 Bank Accounts</span>
                      </div>
                      <div className="funding-perk-item">
                        <Lock size={14} className="perk-icon-check" />
                        <span>256-bit bank-grade SSL encrypted transaction network</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WITHDRAWAL */}
            {activeTab === "Withdrawal" && (
              <div className="funds-two-col-layout">
                {/* Left: Withdrawal Form */}
                <div className="funds-form-card">
                  <h2 style={{ fontSize: 18, marginBottom: 18 }}>Withdraw Funds</h2>

                  {/* Source Account */}
                  <div className="form-group">
                    <label className="form-label">Select Trading Account</label>
                    <select
                      className="funds-select"
                      value={withdrawSourceId}
                      onChange={(e) => setWithdrawSourceId(e.target.value)}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          #{acc.id} ({acc.currency} - {acc.flag}) — Balance:{" "}
                          {acc.balance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Balance preview card */}
                  <div className="balance-card-summary">
                    <span>Available for Withdrawal:</span>
                    <b>
                      {withdrawSourceAccount.currency}{" "}
                      {withdrawSourceAccount.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </div>

                  {/* Method */}
                  <div className="form-group">
                    <label className="form-label">Withdrawal Method</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        className={`btn-cancel ${
                          withdrawMethod === "Bank" ? "active" : ""
                        }`}
                        style={{
                          borderColor:
                            withdrawMethod === "Bank" ? "#2ea35a" : undefined,
                        }}
                        onClick={() => setWithdrawMethod("Bank")}
                      >
                        Bank Wire
                      </button>
                      <button
                        className={`btn-cancel ${
                          withdrawMethod === "Crypto" ? "active" : ""
                        }`}
                        style={{
                          borderColor:
                            withdrawMethod === "Crypto" ? "#2ea35a" : undefined,
                        }}
                        onClick={() => setWithdrawMethod("Crypto")}
                      >
                        Crypto Wallet
                      </button>
                    </div>
                  </div>

                  {/* Destination Input */}
                  <div className="form-group">
                    <label className="form-label">
                      {withdrawMethod === "Bank"
                        ? "Beneficiary IBAN / Bank Account Number"
                        : "Recipient Crypto Wallet Address"}
                    </label>
                    <input
                      type="text"
                      className="funds-input"
                      placeholder={
                        withdrawMethod === "Bank"
                          ? "e.g. GB29NWBK60161331926819"
                          : "e.g. 0x71C... or 1A1zP..."
                      }
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                    />
                  </div>

                  {/* Amount */}
                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <div className="amount-input-group">
                      <input
                        type="number"
                        className="funds-input"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                      <button
                        className="currency-select"
                        onClick={() =>
                          setWithdrawAmount(
                            withdrawSourceAccount.balance.toString()
                          )
                        }
                        title="Withdraw Maximum Balance"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {withdrawError && (
                    <div
                      className="error-text"
                      style={{ marginBottom: 16, display: "flex", gap: 6 }}
                    >
                      <AlertCircle size={14} />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  <div className="conversion-preview">
                    <span>Fee: Free (0%)</span>
                    <span>
                      Net Receiving:{" "}
                      <b>
                        {withdrawSourceAccount.currency}{" "}
                        {(parseFloat(withdrawAmount) || 0).toFixed(2)}
                      </b>
                    </span>
                  </div>

                  <button
                    className="btn-proceed"
                    style={{ width: "100%", marginTop: 8 }}
                    onClick={handleRequestWithdrawal}
                  >
                    Request Withdrawal
                  </button>
                </div>

                {/* Right: Withdrawal Policy & Summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="summary-card">
                    <div className="summary-card-title">
                      <span>Withdrawal Policy</span>
                      <ShieldCheck size={16} color="#3ddc84" />
                    </div>
                    <div className="summary-stat-row">
                      <span>Daily Limit</span>
                      <b>$50,000.00</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Remaining Allowance</span>
                      <b className="green">$48,500.00</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Crypto Settlement</span>
                      <b>15 - 30 Minutes</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Bank Wire Settlement</span>
                      <b>1 - 3 Working Days</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Withdrawal Fee</span>
                      <b className="green">Free (0%)</b>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-title">
                      <span>Security Advisory</span>
                      <Lock size={15} color="#3ddc84" />
                    </div>
                    <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
                      For your safety, funds will only be dispatched to bank
                      accounts or crypto addresses officially registered under the
                      same legal identity as your Lieark Crypto Market profile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INTERNAL TRANSFER */}
            {activeTab === "Internal Transfer" && (
              <div className="funds-two-col-layout">
                {/* Left: Transfer Form */}
                <div className="funds-form-card">
                  <h2 style={{ fontSize: 18, marginBottom: 18 }}>
                    Internal Account Transfer
                  </h2>

                  {/* From Account */}
                  <div className="form-group">
                    <label className="form-label">From Trading Account</label>
                    <select
                      className="funds-select"
                      value={transferFromId}
                      onChange={(e) => setTransferFromId(e.target.value)}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          #{acc.id} ({acc.currency} - {acc.flag}) — Balance:{" "}
                          {acc.balance.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap button */}
                  <button
                    className="transfer-swap-btn"
                    onClick={handleSwapTransferAccounts}
                    title="Swap From and To accounts"
                  >
                    <ArrowRightLeft size={16} />
                  </button>

                  {/* To Account */}
                  <div className="form-group">
                    <label className="form-label">To Trading Account</label>
                    <select
                      className="funds-select"
                      value={transferToId}
                      onChange={(e) => setTransferToId(e.target.value)}
                    >
                      {accounts
                        .filter((acc) => acc.id !== transferFromId)
                        .map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            #{acc.id} ({acc.currency} - {acc.flag}) — Balance:{" "}
                            {acc.balance.toFixed(2)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="form-group">
                    <label className="form-label">
                      Amount ({transferFromAcc.currency})
                    </label>
                    <div className="amount-input-group">
                      <input
                        type="number"
                        className="funds-input"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <button
                        className="currency-select"
                        onClick={() =>
                          setTransferAmount(transferFromAcc.balance.toString())
                        }
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Conversion Preview */}
                  {transferFromAcc.currency !== transferToAcc.currency && (
                    <div className="conversion-preview">
                      <span>
                        Conversion ({transferFromAcc.currency} →{" "}
                        {transferToAcc.currency}):
                      </span>
                      <b>
                        ≈ {transferToAcc.currency}{" "}
                        {(
                          (parseFloat(transferAmount) || 0) *
                          (transferFromAcc.currency === "EUR" ? 1.08 : 0.92)
                        ).toFixed(2)}
                      </b>
                    </div>
                  )}

                  {transferError && (
                    <div
                      className="error-text"
                      style={{ marginBottom: 16, display: "flex", gap: 6 }}
                    >
                      <AlertCircle size={14} />
                      <span>{transferError}</span>
                    </div>
                  )}

                  <button
                    className="btn-proceed"
                    style={{ width: "100%", marginTop: 12 }}
                    onClick={handleTransfer}
                  >
                    Transfer Funds
                  </button>
                </div>

                {/* Right: Transfer Flow Overview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="summary-card">
                    <div className="summary-card-title">
                      <span>Transfer Flow</span>
                      <ArrowRightLeft size={16} color="#3ddc84" />
                    </div>
                    <div className="summary-stat-row">
                      <span>Source Account</span>
                      <b>#{transferFromAcc.id} ({transferFromAcc.currency})</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Source Balance</span>
                      <b>{transferFromAcc.currency} {transferFromAcc.balance.toFixed(2)}</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Target Account</span>
                      <b>#{transferToAcc.id} ({transferToAcc.currency})</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Target Balance</span>
                      <b>{transferToAcc.currency} {transferToAcc.balance.toFixed(2)}</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Execution Speed</span>
                      <b className="green">Instant</b>
                    </div>
                    <div className="summary-stat-row">
                      <span>Transfer Fee</span>
                      <b className="green">Zero Commission</b>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-title">
                      <span>Instant Liquidity</span>
                      <Zap size={15} color="#3ddc84" />
                    </div>
                    <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
                      Internal transfers allow you to rebalance margin, protect
                      positions against volatility spikes, or allocate capital
                      across different trading strategies instantly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WALLETS */}
            {activeTab === "Wallets" && (
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 18 }}>
                  Registered Crypto Wallets
                </h2>
                <div className="wallets-grid">
                  {[
                    {
                      coin: "Bitcoin (BTC)",
                      symbol: "BTC",
                      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                      balance: "0.4500 BTC",
                    },
                    {
                      coin: "Tether (USDT)",
                      symbol: "USDT-ERC20",
                      address: "0x71C839088C35A88aC680e640523C63e32b352F1",
                      balance: "3,840.50 USDT",
                    },
                    {
                      coin: "Ethereum (ETH)",
                      symbol: "ETH-ERC20",
                      address: "0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db",
                      balance: "2.1800 ETH",
                    },
                    {
                      coin: "Solana (SOL)",
                      symbol: "SOL",
                      address: "7XwP6Vv8Yk9t1Q2q5R8b3M6p9N0w2K5r7T",
                      balance: "18.250 SOL",
                    },
                  ].map((w) => (
                    <div key={w.symbol} className="wallet-card">
                      <div className="wallet-card-head">
                        <div className="wallet-asset">
                          <Wallet size={18} color="#3ddc84" />
                          <span>{w.coin}</span>
                        </div>
                        <span style={{ fontSize: 12, color: "#8d9097" }}>
                          {w.symbol}
                        </span>
                      </div>
                      <div className="wallet-address-box">
                        <span>{w.address}</span>
                        <button
                          className="bank-copy-btn"
                          onClick={() => handleCopy(w.address, w.coin)}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "#8d9097" }}>Balance:</span>
                        <b style={{ color: "#3ddc84" }}>{w.balance}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: TRANSACTION HISTORY (FULL WIDTH) */}
            {activeTab === "Transaction History" && (
              <div className="history-section">
                <div className="history-toolbar">
                  {/* Filters by Type */}
                  <div className="history-filters">
                    {["All", "Deposit", "Withdrawal", "Transfer"].map((type) => (
                      <button
                        key={type}
                        className={`filter-chip ${
                          historyTypeFilter === type ? "active" : ""
                        }`}
                        onClick={() => setHistoryTypeFilter(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Filter by Status */}
                  <div className="history-filters">
                    {["All", "Approved", "Pending", "Rejected"].map((st) => (
                      <button
                        key={st}
                        className={`filter-chip ${
                          historyStatusFilter === st ? "active" : ""
                        }`}
                        onClick={() => setHistoryStatusFilter(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="history-search-input"
                      placeholder="Search ID, Account, Method..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                    <Search
                      size={15}
                      color="#8d9097"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Transaction Id</th>
                        <th>Account ID/Wallet No.</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                        <th>Method</th>
                        <th>Type</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            style={{
                              textAlign: "center",
                              padding: "40px",
                              color: "#8d9097",
                            }}
                          >
                            No transactions found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx: FundTransaction) => (
                          <tr key={tx.id}>
                            <td className="tx-id">{tx.id}</td>
                            <td>{tx.accountId}</td>
                            <td>
                              <span
                                className={
                                  tx.type === "Deposit"
                                    ? "tx-amount-plus"
                                    : tx.type === "Withdrawal"
                                    ? "tx-amount-minus"
                                    : "tx-id"
                                }
                              >
                                {tx.type === "Deposit"
                                  ? "+"
                                  : tx.type === "Withdrawal"
                                  ? "-"
                                  : ""}
                                {tx.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                            <td>{tx.currency}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  tx.status === "Approved"
                                    ? "approved"
                                    : tx.status === "Pending"
                                    ? "pending"
                                    : "rejected"
                                }`}
                              >
                                {tx.status === "Approved" && (
                                  <CheckCircle2 size={11} />
                                )}
                                {tx.status}
                              </span>
                            </td>
                            <td>{tx.method}</td>
                            <td>
                              <b>{tx.type}</b>
                            </td>
                            <td style={{ color: "#8d9097" }}>{tx.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

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
