const topicSelect = document.getElementById("topicSelect");
const regionSelect = document.getElementById("regionSelect");
const periodButtons = document.querySelectorAll(".period-btn");
const contextLabel = document.getElementById("contextLabel");
const sourceStatus = document.getElementById("sourceStatus");
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
  leadership: "Leadership & Management"
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
    "payments canada", "correspondent banking"
  ],
  banks: [
    "bank", "banks", "banking", "jpmorgan", "j.p. morgan", "citigroup",
    "citi", "bank of america", "wells fargo", "goldman sachs",
    "morgan stanley", "scotiabank", "royal bank", "td bank", "bmo"
  ],
  fintech: [
    "fintech", "stripe", "block", "square", "paypal", "klarna",
    "affirm", "revolut", "wise", "checkout.com", "adyen"
  ],
  ai: [
    "artificial intelligence", " ai ", "openai", "machine learning",
    "cloud", "data center", "chip", "semiconductor", "technology",
    "agentic", "automation"
  ],
  regulation: [
    "regulator", "regulation", "regulatory", "rule", "law",
    "compliance", "antitrust", "sec", "federal reserve", "occ",
    "consumer financial protection", "cfpb", "rpaa"
  ],
  risk: [
    "fraud", "cyber", "cybersecurity", "breach", "hack", "scam",
    "risk", "sanctions", "money laundering", "aml", "outage",
    "resilience"
  ],
  "transaction-banking": [
    "transaction banking", "treasury", "cash management", "liquidity",
    "working capital", "trade finance", "commercial banking",
    "corporate payments", "correspondent banking"
  ],
  markets: [
    "market", "markets", "stocks", "bonds", "treasury yields",
    "inflation", "interest rates", "economy", "economic", "fed",
    "recession", "dollar", "foreign exchange", " fx "
  ],
  "digital-assets": [
    "stablecoin", "crypto", "bitcoin", "ethereum", "token",
    "tokenized", "digital asset", "digital dollar", "cbdc",
    "blockchain", "deposit token"
  ],
  strategy: [
    "acquisition", "acquire", "merger", "m&a", "deal", "partnership",
    "joint venture", "strategy", "restructuring", "spinoff",
    "spin off", "divest", "investment", "expansion"
  ],
  leadership: [
    "ceo", "chief executive", "cfo", "president", "chairman",
    "chairwoman", "executive", "leadership", "management",
    "appoints", "appointed"
  ]
};

const tierBonus = {
  T1: 5,
  T2: 2
};

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

  if (/\bcanada\b|\bcanadian\b|\btoronto\b|\bottawa\b|\bpayments canada\b|\bbank of canada\b/.test(text)) {
    regions.push("canada");
  }
  if (/\bunited states\b|\bu\.s\.\b|\bamerican\b|\bwashington\b|\bnew york\b|\bfederal reserve\b|\bfed\b/.test(text)) {
    regions.push("us");
  }
  if (/\bmexico\b|\bmexican\b|\bmexico city\b/.test(text)) {
    regions.push("mexico");
  }
  if (/\bchile\b|\bchilean\b|\bsantiago\b/.test(text)) {
    regions.push("chile");
  }

  return regions.length ? [...new Set(regions)] : ["all"];
}

function ageHours(dateString) {
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return 9999;

  const ms = Date.now() - timestamp;
  return Math.max(0, ms / 3600000);
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

  let score = 54 + (tierBonus[story.sourceTier] || 0);

  if (hours <= 3) score += 18;
  else if (hours <= 12) score += 15;
  else if (hours <= 24) score += 12;
  else if (hours <= 72) score += 7;
  else if (hours <= 168) score += 3;

  const highImpactTerms = [
    "federal reserve", "fed", "visa", "mastercard", "jpmorgan",
    "bank of america", "citigroup", "paypal", "stripe", "swift",
    "stablecoin", "regulation", "regulator", "acquisition", "merger",
    "billion", "launch", "settlement", "real-time payment", "fraud",
    "cyber", "sanctions", "iso 20022", "cross-border", "liquidity"
  ];

  score += Math.min(
    15,
    highImpactTerms.filter(term => text.includes(term)).length * 3
  );

  if (topics.includes("payments")) score += 5;
  if (topics.includes("strategy")) score += 3;
  if (topics.includes("regulation") || topics.includes("risk")) score += 3;
  if (story.feedName === "Reuters") score += 2;

  return Math.min(99, Math.round(score));
}

function classifySection(story, topics, score) {
  const text = textFor(story);

  if (score >= 86) return "mustKnow";

  if (
    topics.includes("strategy") ||
    /\bacquisition\b|\bmerger\b|\bpartnership\b|\bdeal\b|\brestructur|\bexpansion\b/.test(text)
  ) {
    return "strategy";
  }

  if (
    topics.includes("payments") &&
    /infrastructure|network|rail|clearing|settlement|swift|fednow|rtp|iso 20022|platform|liquidity|messaging|correspondent/.test(text)
  ) {
    return "infrastructure";
  }

  if (
    topics.includes("risk") ||
    topics.includes("regulation") ||
    /operations|operational|outage|fraud|compliance|sanctions|cyber|exception|reconciliation|investigation/.test(text)
  ) {
    return "operations";
  }

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
    section: classifySection(item, topics, score),
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

  const topicOk = topic === "all" || story.topics.includes(topic);
  const regionOk =
    region === "all" ||
    story.regions.includes("all") ||
    story.regions.includes(region);

  return topicOk && regionOk && periodMatches(story);
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

function angleFor(story) {
  if (story.topics.includes("payments")) {
    return "Assess relevance for payment strategy, operating model and client impact.";
  }
  if (story.topics.includes("regulation")) {
    return "Check whether this creates a near-term policy, compliance or product requirement.";
  }
  if (story.topics.includes("risk")) {
    return "Watch for control, fraud-loss, cyber or resilience implications.";
  }
  if (story.topics.includes("strategy")) {
    return "Consider competitive positioning and build / buy / partner implications.";
  }

  return "Monitor for second-order impact on banking and payments.";
}

function decisionFor(story) {
  if (story.section === "infrastructure") {
    return "Review roadmap dependencies and sequencing.";
  }
  if (story.section === "operations") {
    return "Assess controls, process and execution exposure.";
  }
  if (story.section === "strategy") {
    return "Revisit competitive and investment assumptions.";
  }

  return "Determine whether this changes an existing priority.";
}

function financialFor(story) {
  if (story.topics.includes("risk")) return "Potential loss / control-cost impact";
  if (story.topics.includes("strategy")) return "Potential revenue / investment impact";
  if (story.topics.includes("payments")) return "Cost, volume or revenue implications";
  return "Financial impact to be assessed";
}

function sourceMetaLine(story) {
  const parts = [
    story.feedName,
    story.sourceTier,
    story.age
  ].filter(Boolean);

  if (story.linkMode === "indexed") parts.push("indexed headline");

  return parts.map(escapeHtml).join(" · ");
}

function readLabel(story) {
  if (story.feedName === "Reuters") return "Open Reuters headline ↗";
  return `Read on ${escapeHtml(story.feedName)} ↗`;
}

function mainCard(story) {
  const url = safeUrl(story.link);

  return `
    <article class="story-card must-know">
      <div class="story-top">
        <span class="badge">🔥 MUST KNOW</span>
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
          <strong>Financial impact</strong>
          <span>${escapeHtml(financialFor(story))}</span>
        </div>

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
        <span class="meta">${sourceMetaLine(story)}</span>
        <span class="score">${story.score}</span>
      </div>

      <h3>
        <a class="story-link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(story.title)}
        </a>
      </h3>

      ${story.description ? `<p class="summary">${escapeHtml(story.description)}</p>` : ""}

      <a class="read-link" href="${url}" target="_blank" rel="noopener noreferrer">
        ${readLabel(story)}
      </a>
    </article>
  `;
}

function renderSection(section, elementId, large = false) {
  const container = document.getElementById(elementId);

  if (!stories.length) {
    container.innerHTML =
      `<div class="empty-state loading">Loading live sources…</div>`;
    return;
  }

  const filtered = stories
    .filter(story => story.section === section && storyMatches(story))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.pubDate) - new Date(a.pubDate)
    );

  if (!filtered.length) {
    container.innerHTML =
      `<div class="empty-state">No items matched this filter in the selected period.</div>`;
    return;
  }

  container.innerHTML = filtered
    .slice(0, large ? 5 : 8)
    .map(large ? mainCard : compactCard)
    .join("");
}

function updateSourceStatus() {
  sourceStatus.classList.remove("error", "partial");

  if (!sourceMeta) {
    sourceStatus.innerHTML =
      `<span class="status-dot"></span>Sources · connecting…`;
    return;
  }

  const ok = Number(sourceMeta.successfulSources || 0);
  const total = Number(sourceMeta.totalSources || 0);

  if (!stories.length || ok === 0) {
    sourceStatus.classList.add("error");
    sourceStatus.innerHTML =
      `<span class="status-dot"></span>Sources · unavailable`;
    return;
  }

  if (ok < total) sourceStatus.classList.add("partial");

  sourceStatus.innerHTML =
    `<span class="status-dot"></span>${ok}/${total} sources · ${stories.length} items`;
}

function render() {
  const topic = topicLabels[topicSelect.value];
  contextLabel.textContent = `${topic} · ${periodLabels[selectedPeriod]}`;

  renderSection("mustKnow", "mustKnowList", true);
  renderSection("strategy", "strategyList");
  renderSection("infrastructure", "infrastructureList");
  renderSection("operations", "operationsList");
  renderSection("watching", "watchingList");

  updateSourceStatus();
}

async function loadNews() {
  try {
    sourceStatus.classList.remove("error", "partial");
    sourceStatus.innerHTML =
      `<span class="status-dot"></span>Sources · connecting…`;

    const response = await fetch("/.netlify/functions/news", {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`News function returned ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    sourceMeta = data.meta || null;

    stories = items
      .map(enrichStory)
      .filter(story => ageHours(story.pubDate) <= 24 * 30);

    render();
  } catch (error) {
    console.error(error);

    stories = [];
    sourceMeta = {
      successfulSources: 0,
      totalSources: 0
    };

    sourceStatus.classList.add("error");
    sourceStatus.innerHTML =
      `<span class="status-dot"></span>Sources · unavailable`;

    [
      "mustKnowList",
      "strategyList",
      "infrastructureList",
      "operationsList",
      "watchingList"
    ].forEach(id => {
      document.getElementById(id).innerHTML =
        `<div class="empty-state">Could not load the live sources. Check the Netlify Function deployment and try again.</div>`;
    });
  }
}

topicSelect.addEventListener("change", render);
regionSelect.addEventListener("change", render);

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

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

render();
loadNews();
