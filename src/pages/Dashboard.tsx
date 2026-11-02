
import "../styles/dashboard.css";
import { useAppSelector } from "../store/hooks/reduxHooks";
interface CryptoAsset {
    name: string;
    symbol: string;
    price: string;
    change: string;
    marketCap: string;
    volume: string;
    icon: string;
    positive: boolean;
}

const cryptoAssets: CryptoAsset[] = [
    {
        name: "Bitcoin",
        symbol: "BTC",
        price: "$67,432.80",
        change: "+2.45%",
        marketCap: "$1.32T",
        volume: "$28.5B",
        icon: "₿",
        positive: true,
    },
    {
        name: "Ethereum",
        symbol: "ETH",
        price: "$3,521.45",
        change: "+1.82%",
        marketCap: "$423.6B",
        volume: "$14.2B",
        icon: "Ξ",
        positive: true,
    },
    {
        name: "Solana",
        symbol: "SOL",
        price: "$184.62",
        change: "-0.85%",
        marketCap: "$82.4B",
        volume: "$3.8B",
        icon: "◎",
        positive: false,
    },
    {
        name: "Binance Coin",
        symbol: "BNB",
        price: "$598.32",
        change: "+3.21%",
        marketCap: "$87.2B",
        volume: "$1.9B",
        icon: "◆",
        positive: true,
    },
    {
        name: "XRP",
        symbol: "XRP",
        price: "$0.6241",
        change: "-1.24%",
        marketCap: "$34.1B",
        volume: "$1.2B",
        icon: "✕",
        positive: false,
    },
];

const stats = [
    { label: "Total Balance", value: "$124,563.80", change: "+12.45%" },
    { label: "Total Investment", value: "$98,420.00", change: "+8.32%" },
    { label: "Total Profit", value: "$26,143.80", change: "+4.13%" },
    { label: "24h Market Volume", value: "$48.25B", change: "+6.82%" },
];

function Dashboard() {
    const livePrices = useAppSelector(
        (state) => state.crypto.prices
    );

    const connectionStatus = useAppSelector(
        (state) => state.crypto.connectionStatus
    );
    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-icon">₿</span>
                    <span>CryptoMarket</span>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">MENU</p>
                    <nav className="sidebar-nav">
                        <a href="#dashboard" className="nav-item active">
                            <span>▦</span> Dashboard
                        </a>
                        <a href="#markets" className="nav-item">
                            <span>◈</span> Markets
                        </a>
                        <a href="#portfolio" className="nav-item">
                            <span>◫</span> My Portfolio
                        </a>
                        <a href="#transactions" className="nav-item">
                            <span>⇄</span> Transactions
                        </a>
                        <a href="#watchlist" className="nav-item">
                            <span>☆</span> Watchlist
                        </a>
                    </nav>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">PREFERENCES</p>
                    <nav className="sidebar-nav">
                        <a href="#settings" className="nav-item">
                            <span>⚙</span> Settings
                        </a>
                        <a href="#help" className="nav-item">
                            <span>?</span> Help & Support
                        </a>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="user-avatar">JD</div>
                    <div>
                        <strong>John Doe</strong>
                        <span>Premium Account</span>
                    </div>
                    <span className="user-menu">⋮</span>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="topbar">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome back! Here's your crypto market overview.</p>
                    </div>

                    <div className={`connection-status ${connectionStatus}`}>
                        <span className="connection-dot" />
                        {connectionStatus === "connected"
                            ? "Live Market"
                            : connectionStatus === "connecting"
                                ? "Connecting..."
                                : "Disconnected"}
                    </div>
                </header>

                <section className="stats-grid">
                    {stats.map((stat) => (
                        <article className="stat-card" key={stat.label}>
                            <p>{stat.label}</p>
                            <h2>{stat.value}</h2>
                            <span className="positive-change">
                                ↗ {stat.change}
                            </span>
                            <span className="stat-caption">Compared to last month</span>
                        </article>
                    ))}
                </section>

                <section className="content-grid">
                    <article className="panel portfolio-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Portfolio Overview</h2>
                                <p>Your investment performance</p>
                            </div>
                            <button className="period-button">Monthly⌄</button>
                        </div>

                        <div className="portfolio-balance">
                            <h2>$124,563.80</h2>
                            <span>↗ 12.45% <small>vs last month</small></span>
                        </div>

                        <div className="chart">
                            <div className="chart-y-labels">
                                <span>$150K</span>
                                <span>$120K</span>
                                <span>$90K</span>
                                <span>$60K</span>
                                <span>$30K</span>
                            </div>
                            <div className="chart-area">
                                <div className="chart-grid-lines">
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <svg
                                    viewBox="0 0 700 210"
                                    preserveAspectRatio="none"
                                    role="img"
                                    aria-label="Illustrative portfolio growth chart"
                                >
                                    <defs>
                                        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#635bff" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#635bff" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0 170 C40 160 45 130 90 145 S150 120 185 135 S235 90 275 110 S320 80 365 95 S420 65 455 85 S510 35 550 65 S620 20 650 35 L700 10 L700 210 L0 210 Z"
                                        fill="url(#chartFill)"
                                    />
                                    <path
                                        d="M0 170 C40 160 45 130 90 145 S150 120 185 135 S235 90 275 110 S320 80 365 95 S420 65 455 85 S510 35 550 65 S620 20 650 35 L700 10"
                                        fill="none"
                                        stroke="#635bff"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="chart-x-labels">
                                    <span>01 Nov</span>
                                    <span>06 Nov</span>
                                    <span>11 Nov</span>
                                    <span>16 Nov</span>
                                    <span>21 Nov</span>
                                    <span>26 Nov</span>
                                    <span>30 Nov</span>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="panel allocation-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Asset Allocation</h2>
                                <p>Your portfolio distribution</p>
                            </div>
                            <button className="more-button" aria-label="More options">⋯</button>
                        </div>

                        <div className="allocation-chart">
                            <div className="donut">
                                <div className="donut-center">
                                    <strong>100%</strong>
                                    <span>Total Assets</span>
                                </div>
                            </div>
                        </div>

                        <div className="allocation-list">
                            <div><span className="dot bitcoin-dot" /> Bitcoin <strong>45%</strong></div>
                            <div><span className="dot ethereum-dot" /> Ethereum <strong>30%</strong></div>
                            <div><span className="dot solana-dot" /> Solana <strong>15%</strong></div>
                            <div><span className="dot other-dot" /> Others <strong>10%</strong></div>
                        </div>
                    </article>
                </section>

                <section className="panel market-panel" id="markets">
                    <div className="panel-header market-heading">
                        <div>
                            <h2>Top Cryptocurrencies</h2>
                            <p>Explore the latest cryptocurrency market prices</p>
                        </div>
                        <button className="view-all-button">View All →</button>
                    </div>

                    <div className="table-wrapper">
                        <table className="crypto-table">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Price</th>
                                    <th>24h Change</th>
                                    <th>Market Cap</th>
                                    <th>24h Volume</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cryptoAssets.map((asset) => (
                                    <tr key={asset.symbol}>
                                        <td>
                                            <div className="asset-cell">
                                                <span className={`asset-icon ${asset.symbol.toLowerCase()}`}>
                                                    {asset.icon}
                                                </span>
                                                <div>
                                                    <strong>{asset.name}</strong>
                                                    <span>{asset.symbol}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="price-cell">
                                            {livePrices[asset.symbol]
                                                ? `$${Number(livePrices[asset.symbol].price).toLocaleString(
                                                    "en-US",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 6,
                                                    }
                                                )}`
                                                : asset.price}
                                        </td>

                                        <td>
                                            {(() => {
                                                const liveChange = livePrices[asset.symbol]?.change24h;

                                                const isPositive = liveChange
                                                    ? Number(liveChange) >= 0
                                                    : asset.positive;

                                                return (
                                                    <span className={isPositive ? "change-up" : "change-down"}>
                                                        {liveChange !== undefined
                                                            ? `${Number(liveChange) >= 0 ? "+" : ""}${Number(liveChange).toFixed(2)}%`
                                                            : asset.change}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td>{asset.marketCap}</td>
                                        <td>{asset.volume}</td>
                                        <td>
                                            <button className="trade-button">Trade</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="dashboard-footer">
                    <span>© 2026 CryptoMarket. All rights reserved.</span>
                    <span>Market data shown is illustrative.</span>
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;
