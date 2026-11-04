import { useRouter } from "next/router";
import { useAppSelector } from "@/store/index";
import { selectSelectedAccount } from "@/store/slices/fundsSlice";

interface HeaderProps {
  balance?: number;
  equity?: number;
  account?: string;
  onDeposit?: () => void;
}

export default function Header({ balance, equity, account, onDeposit }: HeaderProps) {
  const router = useRouter();
  const selectedAcc = useAppSelector(selectSelectedAccount);

  const displayBalance =
    balance !== undefined ? balance : selectedAcc ? selectedAcc.balance : 14250.0;
  const displayEquity =
    equity !== undefined ? equity : selectedAcc ? selectedAcc.equity : 14250.0;
  const displayAccount =
    account !== undefined ? account : selectedAcc ? `#${selectedAcc.id}` : "#3000009";
  const currencySymbol =
    selectedAcc?.currency === "USD"
      ? "$"
      : selectedAcc?.currency === "GBP"
      ? "£"
      : selectedAcc?.currency === "AED"
      ? "AED "
      : "€";

  const fmt = (v: number): string => `${currencySymbol}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleDepositClick = () => {
    if (onDeposit) {
      onDeposit();
    } else {
      router.push("/funds");
    }
  };

  const handleAccountClick = () => {
    router.push("/accounts");
  };

  return (
    <header className="header">
      <div
        className="brand"
        style={{ cursor: "pointer", fontSize: "19px", letterSpacing: "0.5px" }}
        onClick={() => {
          router.push("/dashboard");
        }}
      >
        Lieark Crypto Market
      </div>
      <div className="header-right">
        <span>
          Balance: <b>{fmt(displayBalance)}</b>
        </span>
        <span>
          Equity: <b>{fmt(displayEquity)}</b>
        </span>
        <button className="btn-ghost" onClick={handleDepositClick}>
          Deposit
        </button>
        <div className="account" onClick={handleAccountClick} style={{ cursor: "pointer" }}>
          <small className="live">LIVE</small>
          <span>{displayAccount} ▾</span>
        </div>
        <div className="avatar">D</div>
      </div>
    </header>
  );
}