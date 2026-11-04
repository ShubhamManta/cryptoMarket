import { useState } from "react";
import {
  BarChart3,
  CandlestickChart,
  Wallet,
  Layers,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { useAppDispatch } from "@/store/index";
import { logout } from "@/store/slices/authStore";


interface NavItem {
  icon: LucideIcon;
  path?: string;
  label: string;
}

const navItems: NavItem[] = [
  { icon: BarChart3, path: "/dashboard", label: "Dashboard" },
  { icon: CandlestickChart, path: "/analytics", label: "Analytics (Beta)" },
  { icon: Wallet, path: "/funds", label: "Manage Funds" },
  { icon: Layers, path: "/accounts", label: "Manage Accounts" },
  // { icon: Users, label: "Community" },
  // { icon: Gift, label: "Rewards" },
  // { icon: Trophy, label: "Leaderboard" },
  // { icon: Settings, label: "Settings" },
  // { icon: Headphones, label: "Support" },
];

interface SidebarProps {
  active?: number;
  onSelect?: (index: number) => void;
}

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentPath = router?.pathname || "/dashboard";

  const activeIndex =
    active !== undefined
      ? active
      : currentPath === "/accounts"
        ? 3
        : currentPath === "/funds"
          ? 2
          : currentPath === "/analytics"
            ? 1
            : 0;

  const handleClick = (index: number, item: NavItem) => {
    if (onSelect) {
      onSelect(index);
    }
    if (item.path) {
      router.push(item.path);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    dispatch(logout());
    router.push("/");
  };

  return (
    <>
      <nav className="sidebar" aria-label="Main Navigation">
        <div className="sidebar-top">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === activeIndex;
            return (
              <button
                key={item.label}
                className={`side-btn ${isActive ? "active" : ""}`}
                onClick={() => handleClick(i, item)}
                title={item.label}
                aria-label={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <button
            className="side-btn logout-btn"
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {showLogoutModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogoutModal(false)}
          role="presentation"
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-title" className="modal-title">
              Confirm Logout
            </h2>
            <p className="modal-text">Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}