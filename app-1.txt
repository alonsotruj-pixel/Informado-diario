const topicSelect = document.getElementById("topicSelect");
const regionSelect = document.getElementById("regionSelect");
const contentTypeSelect = document.getElementById("contentTypeSelect");
const periodButtons = document.querySelectorAll(".period-btn");
const contextLabel = document.getElementById("contextLabel");
const sourceStatus = document.getElementById("sourceStatus");
const sourceStatusText = document.getElementById("sourceStatusText");
const sourcePanel = document.getElementById("sourcePanel");
const sourceList = document.getElementById("sourceList");
const sourceUpdated = document.getElementById("sourceUpdated");
const closeSources = document.getElementById("closeSources");
const navItems = document.querySelectorAll(".nav-item");

let selectedPeriod = "today";
let stories = [];
let sourceMeta = null;

const topicLabels = {
  all: "All topics",
  payments: "Payments",
  banks: "Banks",
  fintech: "Fintechs",
  ai: "AI & Tech",
  regulation: "Regulation",
  risk: "Fraud, Risk & Cyber",
  "transaction-banking": "Transaction Banking",
  markets: "Economy & Markets",
  "digital-assets": "Digital Money & Assets",
  strategy: "Corporate Strategy & M&A",
  business: "Business & Companies",
  world: "World & Geopolitics",
  leadership: "Leadership & Management"
};

const contentTypeLabels = {
  all: "All content",
  news: "News",
  official: "Official",
  report: "Reports",
  insight: "Insights",
  update: "Updates"
};

const periodLabels = {
  today: "Today",
  "7d": "7 Days",
  "30d": "30 Days"
};

const topicKeywords = {
  payments: [
    "payment", "payments", "visa", "mastercard", "paypal", "stripe",
    "fednow", "real-time payment", "instant payment", "rtp",
    "clearing", "settlement", "swift", "ach", "wire transfer",
    "remittance", "cross-border", "merchant", "interchange",
    "card network", "card payments", "payment processor", "iso 20022",
    "payments canada", "correspondent banking", "pix", "upi", "wallet"
  ],
  banks: [
    "bank", "banks", "banking", "jpmorgan", "j.p. morgan", "citigroup",
    "citi", "bank of america", "wells fargo", "goldman sachs",
    "morgan stanley", "scotiabank", "royal bank", "td bank", "bmo",
    "hsbc", "barclays", "santander", "unicredit"
  ],
  fintech: [
    "fintech", "stripe", "block", "square", "paypal", "klarna",
    "affirm", "revolut", "wise", "checkout.com", "adyen", "nuvei",
    "fiserv", "worldpay", "shift4"
  ],
  ai: [
    "artificial intelligence", " ai ", "openai", "anthropic", "machine learning",
    "cloud", "data center", "chip", "semiconductor", "technology",
    "agentic", "automation", "robot", "model"
  ],
  regulation: [
    "regulator", "regulation", "regulatory", "rule", "law",
    "compliance", "antitrust", "sec", "federal reserve", "occ",
    "consumer financial protection", "cfpb", "rpaa", "competition bureau",
    "consultation", "supervisory"
  ],
  risk: [
    "fraud", "cyber", "cybersecurity", "breach", "hack", "scam",
    "risk", "sanctions", "money laundering", "aml", "outage",
    "resilience", "operational risk", "third-party risk"
  ],
  "transaction-banking": [
    "transaction banking", "treasury", "cash management", "liquidity",
    "working capital", "trade finance", "commercial banking",
    "corporate payments", "correspondent banking", "cash concentration"
  ],
  markets: [
    "market", "markets", "stocks", "bonds", "treasury yields",
    "inflation", "interest rates", "economy", "economic", "fed",
    "recession", "dollar", "foreign exchange", " fx ", "oil",
    "employment", "gdp", "central bank", "tariff"
  ],
  "digital-assets": [
    "stablecoin", "crypto", "bitcoin", "ethereum", "token",
    "tokenized", "tokenised", "digital asset", "digital dollar", "cbdc",
    "blockchain", "deposit token", "onchain"
  ],
  strategy: [
    "acquisition", "acquire", "merger", "m&a", "deal", "partnership",
    "joint venture", "strategy", "restructuring", "spinoff",
    "spin off", "divest", "investment", "expansion", "stake",
    "sale of", "buyout"
  ],
  business: [
    "earnings", "revenue", "profit", "company", "companies", "business",
    "sales", "forecast", "guidance", "shares", "valuation", "ipo",
    "layoff", "workforce", "investment"
  ],
  world: [
    "war", "trade", "tariff", "sanction", "geopolit", "diplomacy",
    "china", "india", "european union", "iran", "ukraine", "middle east",
    "g7", "g20", "global"
  ],
  leadership: [
    "ceo", "chief executive", "cfo", "president", "chairman",
    "chairwoman", "executive", "leadership", "management",
    "appoints", "appointed", "chief operating officer", "coo"
  ]
};

const tierBonus = { T1: 6, T2: 2 };

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function textFor(story) {
  return ` ${cleanText(story.title)} ${cleanText(story.description)} `.toLowerCase();
}

function classifyTopics(story) {
  const text = textFor(story);
  const matches = [];

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      matches.push(topic);
    }
  });

  return matches.length ? [...new Set(matches)] : ["all"];
}

function classifyRegions(story) {
  const text = textFor(story);
  const regions = [];

  if (/\bcanada\b|\bcanadian\b|\btoronto\b|\bottawa\b|\bpayments canada\b|\bbank of canada\b/.test(text)) regions.push("canada");
  if (/\bunited states\b|\bu\.s\.\b|\bamerican\b|\bwashington\b|\bnew york\b|\bfederal reserve\b|\bfed\b/.test(text)) regions.push("us");
  if (/\bmexico\b|\bmexican\b|\bmexico city\b/.test(text)) regions.push("mexico");
  if (/\bchile\b|\bchilean\b|\bsantiago\b/.test(text)) regions.push("chile");
  if (/\blatin america\b|\blatam\b|\bbrazil\b|\bargentina\b|\bcolombia\b|\bperu\b/.test(text)) regions.push("latam");
  if (/\beurope\b|\beuropean\b|\beu\b|\buk\b|\bbritain\b|\bfrance\b|\bgermany\b|\bitaly\b|\bspain\b/.test(text)) regions.push("europe");
  if (/\basia\b|\bchina\b|\bindia\b|\bjapan\b|\bsingapore\b|\bhong kong\b|\bkorea\b/.test(text)) regions.push("asia");

  return regions.length ? [...new Set(regions)] : ["all"];
}

function ageHours(dateString) {
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return 9999;
  return Math.max(0, (Date.now() - timestamp) / 3600000);
}

function recencyLabel(dateString) {
  const hours = ageHours(dateString);
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

function executiveScore(story, topics) {
  const text = textFor(story);
  const hours = ageHours(story.pubDate);
  let score = 45 + (tierBonus[story.sourceTier] || 0);

  if (hours <= 3) score += 20;
  else if (hours <= 12) score += 17;
  else if (hours <= 24) score += 14;
  else if (hours <= 72) score += 9;
  else if (hours <= 168) score += 5;

  const highImpactTerms = [
    "federal reserve", "interest rate", "inflation", "tariff", "sanctions",
    "visa", "mastercard", "jpmorgan", "bank of america", "citigroup",
    "paypal", "stripe", "swift", "stablecoin", "regulation", "regulator",
    "acquisition", "merger", "billion", "launch", "settlement",
    "real-time payment", "fraud", "cyber", "iso 20022", "cross-border",
    "liquidity", "recession", "oil", "war", "central bank"
  ];

  score += Math.min(16, highImpactTerms.filter(term => text.includes(term)).length * 2);

  if (topics.includes("payments")) score += 5;
  if (topics.includes("strategy")) score += 3;
  if (topics.includes("regulation") || topics.includes("risk")) score += 3;
  if (topics.includes("markets") || topics.includes("world")) score += 2;

  if (story.sourceKind === "primary") score += 2;
  score += Math.min(8, Math.max(0, Number(story.corroboration || 1) - 1) * 2);

  if (["Reuters", "The Wall Street Journal", "Financial Times", "Bloomberg"].includes(story.feedName)) {
    score += 3;
  }

  return Math.min(99, Math.round(score));
}

function classifySection(story, topics) {
  const text = textFor(story);

  if (
    topics.includes("strategy") ||
    /\bacquisition\b|\bmerger\b|\bpartnership\b|\bdeal\b|\brestructur|\bdivest|\bexpansion\b|\bstake\b/.test(text)
  ) return "strategy";

  if (
    topics.includes("payments") &&
    /infrastructure|network|rail|clearing|settlement|swift|fednow|rtp|iso 20022|platform|liquidity|messaging|correspondent|ledger|instant payment/.test(text)
  ) return "infrastructure";

  if (
    topics.includes("risk") ||
    /operations|operational|outage|fraud|compliance|sanctions|cyber|exception|reconciliation|investigation|resilience/.test(text)
  ) return "operations";

  if (topics.includes("payments")) return "payments";

  return "watching";
}

function enrichStory(item) {
  const topics = classifyTopics(item);
  const regions = classifyRegions(item);
  const score = executiveScore(item, topics);

  return {
    ...item,
    topics,
    regions,
    score,
    section: classifySection(item, topics),
    age: recencyLabel(item.pubDate)
  };
}

function periodMatches(story) {
  const hours = ageHours(story.pubDate);
  if (selectedPeriod === "today") return hours <= 30;
  if (selectedPeriod === "7d") return hours <= 24 * 7;
  return hours <= 24 * 30;
}

function storyMatches(story) {
  const topic = topicSelect.value;
  const region = regionSelect.value;
  const contentType = contentTypeSelect.value;

  const topicOk = topic === "all" || story.topics.includes(topic);
  const regionOk =
    region === "all" ||
    story.regions.includes("all") ||
    story.regions.includes(region);
  const contentOk = contentType === "all" || story.contentType === contentType;

  return topicOk && regionOk && contentOk && periodMatches(story);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(url = "") {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
  } catch {
    return "#";
  }
}

function contentBadge(story) {
  const labels = {
    news: "NEWS",
    official: "OFFICIAL",
    report: "REPORT",
    insight: "INSIGHT",
    update: "UPDATE"
  };

  return `<span class="content-badge type-${escapeHtml(story.contentType)}">${labels[story.contentType] || "OTHER"}</span>`;
}

function sourceMetaLine(story) {
  const parts = [
    story.feedName,
    story.sourceTier,
    story.sourceKind === "primary" ? "Primary source" : "Media",
    story.age
  ];

  if (story.linkMode === "indexed") parts.push("Indexed headline");
  if (Number(story.corroboration || 1) > 1) parts.push(`${story.corroboration} sources`);

  return parts.filter(Boolean).map(escapeHtml).join(" · ");
}

function angleFor(story) {
  if (story.topics.includes("payments")) return "Assess implications for Payments strategy, clients and operating model.";
  if (story.topics.includes("markets")) return "Consider funding, liquidity, valuations and client activity.";
  if (story.topics.includes("regulation")) return "Check for product, compliance or execution requirements.";
  if (story.topics.includes("risk")) return "Watch for control, cyber, fraud-loss or resilience implications.";
  if (story.topics.includes("strategy")) return "Consider competitive positioning and build / buy / partner implications.";
  if (story.topics.includes("world")) return "Watch for second-order effects on markets, trade and financial institutions.";
  return "Determine whether this changes an existing priority or assumption.";
}

function decisionFor(story) {
  if (story.section === "infrastructure") return "Review roadmap dependencies and sequencing.";
  if (story.section === "operations") return "Assess controls, process and execution exposure.";
  if (story.section === "strategy") return "Revisit competitive and investment assumptions.";
  if (story.section === "payments") return "Assess product, client and network implications.";
  return "Determine whether this needs deeper follow-up.";
}

function readLabel(story) {
  return story.linkMode === "indexed"
    ? `Open ${escapeHtml(story.feedName)} headline ↗`
    : `Read on ${escapeHtml(story.feedName)} ↗`;
}

function mainCard(story) {
  const url = safeUrl(story.link);

  return `
    <article class="story-card must-know">
      <div class="story-top">
        <div class="badge-row">
          ${contentBadge(story)}
          <span class="must-badge">🔥 MUST KNOW</span>
        </div>
        <span class="score">${story.score}/100</span>
      </div>

      <h3>
        <a class="story-link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(story.title)}
        </a>
      </h3>

      <p class="meta">${sourceMetaLine(story)}</p>

      ${story.description ? `<p class="summary">${escapeHtml(story.description)}</p>` : ""}

      <div class="impact-grid">
        <div class="impact-box">
          <strong>Decision angle</strong>
          <span>${escapeHtml(decisionFor(story))}</span>
        </div>
        <div class="impact-box">
          <strong>Your angle</strong>
          <span>${escapeHtml(angleFor(story))}</span>
        </div>
      </div>

      <a class="read-link" href="${url}" target="_blank" rel="noopener noreferrer">
        ${readLabel(story)}
      </a>
    </article>
  `;
}

function compactCard(story) {
  const url = safeUrl(story.link);

  return `
    <article class="story-card">
      <div class="story-top">
        <div class="badge-row">
          ${contentBadge(story)}
          <span class="meta">${escapeHtml(story.feedName)} · ${escapeHtml(story.age)}</span>
        </div>
        <span class="score">${story.score}</span>
      </div>

      <h3>
        <a class="story-link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(story.title)}
        </a>
      </h3>

      <p class="meta">${sourceMetaLine(story)}</p>

      ${story.description ? `<p class="summary">${escapeHtml(story.description)}</p>` : ""}

      <a class="read-link" href="${url}" target="_blank" rel="noopener noreferrer">
        ${readLabel(story)}
      </a>
    </article>
  `;
}

function getFilteredStories() {
  return stories
    .filter(storyMatches)
    .sort((a, b) => b.score - a.score || new Date(b.pubDate) - new Date(a.pubDate));
}

function renderMustKnow() {
  const container = document.getElementById("mustKnowList");

  if (!stories.length) {
    container.innerHTML = `<div class="empty-state loading">Loading live sources…</div>`;
    return;
  }

  const filtered = getFilteredStories().slice(0, 5);

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">No items matched this filter in the selected period.</div>`;
    return;
  }

  container.innerHTML = filtered.map(mainCard).join("");
}

function renderSection(section, elementId) {
  const container = document.getElementById(elementId);

  if (!stories.length) {
    container.innerHTML = `<div class="empty-state loading">Loading live sources…</div>`;
    return;
  }

  const filtered = getFilteredStories()
    .filter(story => story.section === section)
    .slice(0, 8);

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">No items matched this section and filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(compactCard).join("");
}

function formatUpdatedAt(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not available";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderSourcePanel() {
  if (!sourceMeta?.sources?.length) {
    sourceList.innerHTML = `<div class="empty-state">Source status is not available yet.</div>`;
    sourceUpdated.textContent = "Checking connections…";
    return;
  }

  sourceUpdated.textContent = `Last checked ${formatUpdatedAt(sourceMeta.updatedAt)}`;

  sourceList.innerHTML = sourceMeta.sources.map(source => {
    const statusLabel =
      source.status === "active" ? "Active" :
      source.status === "partial" ? "Partial" :
      "Unavailable";

    const connectionLabel =
      source.connection === "direct" ? "Direct feed" :
      source.connection === "mixed" ? "Mixed" :
      "Indexed";

    return `
      <div class="source-row">
        <span class="source-state ${escapeHtml(source.status)}"></span>
        <div class="source-copy">
          <strong>${escapeHtml(source.name)}</strong>
          <span>${escapeHtml(source.tier)} · ${escapeHtml(source.kind === "primary" ? "Primary source" : "Media")} · ${escapeHtml(connectionLabel)}</span>
          ${source.error ? `<small>${escapeHtml(source.error)}</small>` : ""}
        </div>
        <div class="source-count">
          <strong>${Number(source.itemCount || 0)}</strong>
          <span>${statusLabel}</span>
        </div>
      </div>
    `;
  }).join("");
}

function updateSourceStatus() {
  sourceStatus.classList.remove("error", "partial");

  if (!sourceMeta) {
    sourceStatusText.textContent = "Sources · connecting…";
    return;
  }

  const active = Number(sourceMeta.activeSources || 0);
  const total = Number(sourceMeta.totalSources || 0);
  const partial = Number(sourceMeta.partialSources || 0);

  if (!stories.length || active === 0) {
    sourceStatus.classList.add("error");
    sourceStatusText.textContent = "Sources · unavailable";
  } else {
    if (active < total || partial > 0) sourceStatus.classList.add("partial");
    sourceStatusText.textContent = `Sources · ${active}/${total}`;
  }

  renderSourcePanel();
}

function render() {
  const parts = [
    topicLabels[topicSelect.value],
    contentTypeSelect.value !== "all" ? contentTypeLabels[contentTypeSelect.value] : null,
    periodLabels[selectedPeriod]
  ].filter(Boolean);

  contextLabel.textContent = parts.join(" · ");

  renderMustKnow();
  renderSection("payments", "paymentsList");
  renderSection("strategy", "strategyList");
  renderSection("infrastructure", "infrastructureList");
  renderSection("operations", "operationsList");
  renderSection("watching", "watchingList");
  updateSourceStatus();
}

async function loadNews() {
  try {
    sourceStatus.classList.remove("error", "partial");
    sourceStatusText.textContent = "Sources · connecting…";

    const response = await fetch("/.netlify/functions/news", {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error(`News function returned ${response.status}`);

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    sourceMeta = data.meta || null;

    stories = items.map(enrichStory).filter(story => ageHours(story.pubDate) <= 24 * 30);
    render();
  } catch (error) {
    console.error(error);

    stories = [];
    sourceMeta = {
      activeSources: 0,
      totalSources: 0,
      sources: []
    };

    sourceStatus.classList.add("error");
    sourceStatusText.textContent = "Sources · unavailable";

    [
      "mustKnowList",
      "paymentsList",
      "strategyList",
      "infrastructureList",
      "operationsList",
      "watchingList"
    ].forEach(id => {
      document.getElementById(id).innerHTML =
        `<div class="empty-state">Could not load the live sources. Check the Netlify Function deployment and try again.</div>`;
    });

    renderSourcePanel();
  }
}

function setSourcesOpen(open) {
  sourcePanel.hidden = !open;
  sourceStatus.setAttribute("aria-expanded", String(open));
}

sourceStatus.addEventListener("click", event => {
  event.stopPropagation();
  setSourcesOpen(sourcePanel.hidden);
});

closeSources.addEventListener("click", event => {
  event.stopPropagation();
  setSourcesOpen(false);
});

sourcePanel.addEventListener("click", event => event.stopPropagation());
document.addEventListener("click", () => setSourcesOpen(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") setSourcesOpen(false);
});

topicSelect.addEventListener("change", render);
regionSelect.addEventListener("change", render);
contentTypeSelect.addEventListener("change", render);

periodButtons.forEach(button => {
  button.addEventListener("click", () => {
    periodButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedPeriod = button.dataset.period;
    render();
  });
});

navItems.forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;

    navItems.forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

render();
loadNews();
