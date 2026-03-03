import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle,
  Zap,
  Bot,
  Globe,
  Database,
  BarChart,
  Layout,
  Image,
  AlertCircle,
  Loader2,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  X,
} from "lucide-react";
import "./App.css";

// --- Types ---
interface CampaignData {
  productName: string;
  websiteUrl: string;
  productDescription?: string;
  targetAudience: string;
  budget: string;
  location: string;
}

interface GeneratedAd {
  campaignName: string;
  headlines: { text: string; explanation: string }[];
  descriptions: { text: string; explanation: string }[];
  keywords: { term: string; explanation: string }[];
  locations: { name: string; explanation: string }[];
  languages: string[];
  demographics: {
    age: string[];
    gender: string[];
    explanation: string;
  };
  biddingStrategy: { name: string; explanation: string };
  audienceSegments: {
    name: string;
    explanation: string;
  }[];
  images?: string[];
  adGroupName: string;
  keywordInsights: {
    term: string;
    monthlyVolume: number;
    avgCPC: string;
    competition: string;
  }[];
}

// --- App Component ---
export default function App() {
  const [step, setStep] = useState<
    "landing" | "wizard" | "generating" | "review"
  >("landing");
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [formData, setFormData] = useState<CampaignData>({
    productName: "",
    websiteUrl: "",
    productDescription: "",
    targetAudience: "",
    budget: "",
    location: "",
  });
  const [generatedCampaign, setGeneratedCampaign] =
    useState<GeneratedAd | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
  const startWizard = () => {
    setError(null);
    setGeneratedCampaign(null);
    setStep("wizard");
  };

  const handleGenerate = async () => {
    if (!formData.productName) {
      setError("Product Name is required to identify your campaign.");
      setStep("wizard");
      return;
    }

    console.log("🚀 Launching AI Agent for product:", formData.productName);
    setError(null);
    setStep("generating");

    try {
      const response = await fetch(
        "http://localhost:3001/api/generate-campaign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate campaign");
      }

      const data = await response.json();
      setGeneratedCampaign(data);
      setStep("review");
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(
        err.message ||
          "An unexpected error occurred. Please check your backend.",
      );
      setStep("wizard");
    }
  };

  return (
    <div className="app-container">
      {/* Background elements */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <header className="navbar">
        <div className="navbar-logo">
          <Rocket className="icon-primary" />
          <span>
            Impact <span className="gradient-text">Ads</span>
          </span>
        </div>
        <nav className="navbar-links">
          <a href="#">Solutions</a>
          <a href="#">Pricing</a>
          <button className="btn-secondary">Contact Sales</button>
        </nav>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.section
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hero-section"
            >
              <h1 className="hero-title">
                Launch High-Performing Ads <br />
                <span className="gradient-text">Powered by AI</span>
              </h1>
              <p className="hero-subtitle">
                Revolutionize your Google Ads strategy. Describe your product,{" "}
                <br />
                and let our LLMs generate ready-to-launch campaigns in seconds.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={startWizard}>
                  Start Campaign <ArrowRight size={20} />
                </button>
                <button className="btn-outline">View Demo</button>
              </div>

              {/* Features Grid */}
              <div className="features-grid">
                {[
                  {
                    icon: <Bot size={24} />,
                    title: "LLM-Powered Copy",
                    desc: "Expert ad headlines and descriptions automatically generated.",
                  },
                  {
                    icon: <Target size={24} />,
                    title: "Precision Targeting",
                    desc: "AI-driven keyword research for maximum reach.",
                  },
                  {
                    icon: <Zap size={24} />,
                    title: "Instant Deployment",
                    desc: "Push campaigns directly to Google Ads with one click.",
                  },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    className="feature-card glass"
                    whileHover={{ y: -5, borderColor: "var(--primary)" }}
                  >
                    <div className="feature-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {step === "wizard" && (
            <motion.section
              key="wizard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="wizard-container glass"
            >
              <div className="wizard-header">
                <h2>Campaign Mission Briefing</h2>
                <p>Tell us about your campaign objectives.</p>
              </div>

              {error && (
                <div
                  className="error-message glass"
                  style={{
                    borderColor: "var(--error)",
                    color: "var(--error)",
                    padding: "1rem",
                    marginBottom: "2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <div className="wizard-form">
                <div className="form-group">
                  <label>Product/Service Name</label>
                  <input
                    type="text"
                    placeholder="e.g. SolarFlow Pro"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Website URL (Agent will analyze this)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Product Description{" "}
                    <span
                      className="text-secondary"
                      style={{ fontSize: "0.75rem" }}
                    >
                      (Alternative to URL)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Briefly explain what you're selling. If you provided a URL, you can leave this blank."
                    value={formData.productDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productDescription: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Target Audience{" "}
                      <span
                        className="text-secondary"
                        style={{ fontSize: "0.75rem" }}
                      >
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="AI will guess if left blank"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAudience: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    className="form-row-inner"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div className="form-group">
                      <label>
                        Daily Budget{" "}
                        <span
                          className="text-secondary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $50"
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Location{" "}
                        <span
                          className="text-secondary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Worldwide"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="wizard-actions">
                <button
                  className="btn-outline"
                  onClick={() => setStep("landing")}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleGenerate}>
                  Prepare Campaign <Sparkles size={18} />
                </button>
              </div>
            </motion.section>
          )}

          {step === "generating" && (
            <motion.section
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="generation-status"
            >
              <div className="loader-container">
                <div className="loader-ring"></div>
                <Bot className="loader-icon pulse" size={48} />
              </div>
              <h2>Assembling Your Campaign...</h2>
              <p>Analyzing market trends and generating high-impact ad copy.</p>

              <div className="status-timeline">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="status-item active"
                >
                  <CheckCircle size={16} /> Reading briefing...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="status-item active"
                >
                  <CheckCircle size={16} /> Identifying keywords...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.5 }}
                  className="status-item loading"
                >
                  <Loader2 size={16} className="spin" /> Finalizing ad copy...
                </motion.div>
              </div>
            </motion.section>
          )}

          {step === "review" && generatedCampaign && (
            <motion.section
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="review-container"
            >
              <div className="review-header">
                <div className="review-title">
                  <h2>Mission Briefing Complete</h2>
                  <p className="text-muted">{generatedCampaign.campaignName}</p>
                </div>
                <div className="review-actions">
                  <button
                    className="btn-outline"
                    onClick={() => setStep("wizard")}
                  >
                    Edit Brief
                  </button>
                  <button className="btn-primary-glow">
                    Deploy to Google Ads <Globe size={18} />
                  </button>
                </div>
              </div>

              <div className="review-grid">
                {/* Ad Preview */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="review-card glass"
                >
                  <h3>
                    <Layout size={18} /> Optimized Ad Preview
                  </h3>
                  <div className="ad-preview" style={{ padding: "1.5rem" }}>
                    <div className="ad-preview-header">
                      <span className="ad-label">Ad</span> www.
                      {formData.productName.toLowerCase().replace(/\s+/g, "")}
                      .com
                    </div>
                    {generatedCampaign.headlines?.[0] && (
                      <div
                        className="ad-preview-headline tooltip-container"
                        style={{ display: "block" }}
                      >
                        {generatedCampaign.headlines[0].text}
                        <div
                          className="tooltip-text"
                          style={{
                            bottom: "auto",
                            top: "100%",
                            marginTop: "5px",
                          }}
                        >
                          {generatedCampaign.headlines[0].explanation}
                        </div>
                      </div>
                    )}
                    {generatedCampaign.descriptions?.[0] && (
                      <div
                        className="ad-preview-description tooltip-container"
                        style={{ display: "block" }}
                      >
                        <p style={{ margin: 0 }}>
                          {generatedCampaign.descriptions[0].text}
                        </p>
                        <div
                          className="tooltip-text"
                          style={{
                            bottom: "auto",
                            top: "100%",
                            marginTop: "5px",
                          }}
                        >
                          {generatedCampaign.descriptions[0].explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Keywords & Logic */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="review-card glass"
                >
                  <h3
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Database size={18} /> Keyword Strategy
                    </div>
                    <button
                      onClick={() => setShowKeywordModal(true)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Insights <TrendingUp size={14} />
                    </button>
                  </h3>
                  <div className="keyword-list">
                    {(generatedCampaign.keywords || []).map((kw, i) => (
                      <div key={i} className="tooltip-container">
                        <span className="keyword-tag">
                          {kw.term}{" "}
                          <HelpCircle
                            size={10}
                            style={{ marginLeft: "4px", opacity: 0.6 }}
                          />
                        </span>
                        <div className="tooltip-text">{kw.explanation}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                      <Target
                        size={14}
                        style={{ display: "inline", marginRight: "4px" }}
                      />
                      Targeting: {formData.targetAudience}
                    </p>
                  </div>
                </motion.div>

                {/* Full Width Targeting & Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="review-card glass full-width"
                >
                  <h3>
                    <Target size={18} /> Targeting & Bidding Configuration
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "2rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            margin: 0,
                          }}
                        >
                          Locations
                        </h4>
                      </div>
                      <div className="keyword-list">
                        {(generatedCampaign.locations || []).map((loc, i) => (
                          <div key={i} className="tooltip-container">
                            <span className="keyword-tag">
                              {loc.name}{" "}
                              <HelpCircle
                                size={10}
                                style={{ marginLeft: "4px", opacity: 0.6 }}
                              />
                            </span>
                            <div className="tooltip-text">
                              {loc.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            margin: 0,
                          }}
                        >
                          Demographics
                        </h4>
                        <div className="tooltip-container">
                          <HelpCircle size={14} className="icon-help" />
                          <div className="tooltip-text">
                            {generatedCampaign.demographics?.explanation}
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.95rem" }}>
                        <strong>Age:</strong>{" "}
                        {generatedCampaign.demographics?.age?.join(", ") ||
                          "N/A"}
                        <br />
                        <strong>Gender:</strong>{" "}
                        {generatedCampaign.demographics?.gender?.join(", ") ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            margin: 0,
                          }}
                        >
                          Strategy
                        </h4>
                        <div className="tooltip-container">
                          <HelpCircle size={14} className="icon-help" />
                          <div className="tooltip-text">
                            {generatedCampaign.biddingStrategy?.explanation}
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.95rem" }}>
                        <strong>Bidding:</strong>{" "}
                        {generatedCampaign.biddingStrategy?.name || "N/A"}
                        <br />
                        <strong>Languages:</strong>{" "}
                        {generatedCampaign.languages?.join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Creative / Media Assets */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="review-card glass"
                >
                  <h3>
                    <Image size={18} /> Creative / Media Assets
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {(generatedCampaign.images || []).length > 0 ? (
                      (generatedCampaign.images || []).map((img, i) => (
                        <div
                          key={i}
                          style={{
                            aspectRatio: "1",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid var(--border-color)",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Scraped asset ${i}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div
                        className="text-muted"
                        style={{
                          gridColumn: "span 4",
                          textAlign: "center",
                          padding: "1.5rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        No image assets detected on the landing page.
                      </div>
                    )}
                  </div>
                  <p
                    className="text-muted"
                    style={{ fontSize: "0.8rem", marginTop: "auto" }}
                  >
                    AI detected ({(generatedCampaign.images || []).length})
                    visual assets to enhance your Responsive Display Ads.
                  </p>
                </motion.div>

                {/* Performance Estimation */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="review-card glass"
                >
                  <h3>
                    <BarChart size={18} /> Performance Engine
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="gradient-text"
                        style={{ fontSize: "2.5rem", fontWeight: 800 }}
                      >
                        92.5
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          className="text-muted"
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          Optimization
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--success)",
                          }}
                        >
                          Highly Effective
                        </div>
                      </div>
                    </div>
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Based on your ${formData.budget || "0"} budget and AI
                      targeting for {generatedCampaign.locations[0]?.name}, we
                      expect a 4.8% CTR with an estimated conversion rate of
                      3.2%.
                    </p>
                    <div>
                      <h4
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Audience Interests
                      </h4>
                      <div className="keyword-list">
                        {(generatedCampaign.audienceSegments || []).map(
                          (seg: any, i: number) => (
                            <div key={i} className="tooltip-container">
                              <span
                                className="keyword-tag"
                                style={{
                                  fontSize: "0.75rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                }}
                              >
                                {seg.name}{" "}
                                <HelpCircle size={12} className="icon-help" />
                              </span>
                              <div className="tooltip-text">
                                {seg.explanation}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Launch Campaign Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                style={{
                  marginTop: "4rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1.5rem",
                  padding: "2rem",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <div style={{ textAlign: "center", maxWidth: "450px" }}>
                  <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    Ready for Liftoff?
                  </h3>
                  <p className="text-muted" style={{ fontSize: "0.95rem" }}>
                    Everything is analyzed and optimized. One click to deploy
                    this campaign directly to Google Ads.
                  </p>
                </div>
                <button
                  className="btn-primary-glow"
                  style={{
                    padding: "1.25rem 3.5rem",
                    fontSize: "1.2rem",
                    borderRadius: "16px",
                  }}
                  onClick={() =>
                    alert(
                      "Campaign deployment initiated! Accessing Google Ads API...",
                    )
                  }
                >
                  Launch Campaign <Rocket size={24} />
                </button>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Keyword Insights Modal */}
      <AnimatePresence>
        {showKeywordModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeywordModal(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "80vh",
                overflow: "hidden",
                borderRadius: "24px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-dark)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "1.5rem 2rem",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <TrendingUp size={20} className="text-primary" /> Keyword
                    Market Insights
                  </h3>
                  <p
                    className="text-muted"
                    style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}
                  >
                    Competitive analysis and estimated costs for similar search
                    terms.
                  </p>
                </div>
                <button
                  onClick={() => setShowKeywordModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: "2rem", overflowY: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <th style={{ paddingBottom: "1rem", fontWeight: 600 }}>
                        Keyword
                      </th>
                      <th style={{ paddingBottom: "1rem", fontWeight: 600 }}>
                        Monthly Vol.
                      </th>
                      <th style={{ paddingBottom: "1rem", fontWeight: 600 }}>
                        Competition
                      </th>
                      <th style={{ paddingBottom: "1rem", fontWeight: 600 }}>
                        Avg. CPC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(generatedCampaign?.keywordInsights || []).map((ki, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          fontSize: "0.9rem",
                        }}
                      >
                        <td
                          style={{
                            padding: "1rem 0",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                          }}
                        >
                          {ki.term}
                        </td>
                        <td
                          style={{
                            padding: "1rem 0",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {ki.monthlyVolume.toLocaleString()}
                        </td>
                        <td style={{ padding: "1rem 0" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              backgroundColor:
                                ki.competition === "High"
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : ki.competition === "Medium"
                                    ? "rgba(245, 158, 11, 0.1)"
                                    : "rgba(16, 185, 129, 0.1)",
                              color:
                                ki.competition === "High"
                                  ? "#ef4444"
                                  : ki.competition === "Medium"
                                    ? "#f59e0b"
                                    : "#10b981",
                            }}
                          >
                            {ki.competition}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "1rem 0",
                            fontWeight: 600,
                            color: "var(--primary)",
                          }}
                        >
                          {ki.avgCPC}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!generatedCampaign?.keywordInsights ||
                  generatedCampaign.keywordInsights.length === 0) && (
                  <div style={{ textAlign: "center", padding: "3rem 0" }}>
                    <Database
                      size={40}
                      className="text-muted"
                      style={{ opacity: 0.2, marginBottom: "1rem" }}
                    />
                    <p className="text-muted">
                      No additional keyword insights available for this specific
                      niche.
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border-color)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={() => setShowKeywordModal(false)}
                >
                  Close Insights
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="app-footer">
        <p>© 2026 Impact Ads. All systems nominal.</p>
      </footer>
    </div>
  );
}
