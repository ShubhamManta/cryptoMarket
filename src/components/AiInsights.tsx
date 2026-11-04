import { useRouter } from "next/router";

interface AiInsightsProps {
  risk?: "Low" | "Medium" | "High";
  text?: string;
}

export default function AiInsights({
  risk = "Low",
  text = "No open positions or margin usage. Zero account balance eliminates any active risk exposure.",
}: AiInsightsProps) {
  const router = useRouter();

  const handleViewAnalytics = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/analytics");
  };

  return (
    <div className="ai">
      <div className="ai-head">
        <span><em>AI</em> Insights</span>
        <a href="/analytics" onClick={handleViewAnalytics}>
          View Analytics ›
        </a>
      </div>
      <div className="ai-card">
        <b className="risk">Risk: {risk}</b>
        <p>{text}</p>
        <div className="ai-foot">
          <span>Ask AI</span>
          <span onClick={handleViewAnalytics} style={{ cursor: "pointer" }}>
            Full Analysis
          </span>
        </div>
      </div>
    </div>
  );
}
