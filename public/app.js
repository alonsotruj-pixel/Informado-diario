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
const paymentPillarButtons = document.querySelectorAll(".payment-pill");

let selectedPeriod = "today";
let selectedPaymentPillar = "all";
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
  "7d": "7-day catch-up",
  "30d": "30-day catch-up"
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

  // 1) Source quality: max 20
  let sourceScore = story.sourceTier === "T1" ? 18 : story.sourceTier === "T2" ? 12 : 8;
  if (story.sourceKind === "primary") sourceScore += 2;
  sourceScore = Math.min(20, sourceScore);

  // 2) Recency: max 20
  let recencyScore = 0;
  if (hours <= 3) recencyScore = 20;
  else if (hours <= 12) recencyScore = 17;
  else if (hours <= 24) recencyScore = 14;
  else if (hours <= 72) recencyScore = 10;
  else if (hours <= 168) recencyScore = 6;
  else if (hours <= 24 * 30) recencyScore = 2;

  // 3) Executive impact: max 30
  const highImpactTerms = [
    "interest rate", "inflation", "tariff", "trade war", "sanction", "war",
    "oil", "recession", "central bank", "acquisition", "merger", "billion",
    "stablecoin", "fraud", "cyber", "regulation", "regulator", "cross-border",
    "settlement", "real-time payment", "instant payment", "iso 20022", "swift",
    "bank charter", "liquidity", "visa", "mastercard", "jpmorgan"
  ];
  const impactHits = highImpactTerms.filter(term => text.includes(term)).length;
  const impactScore = Math.min(30, impactHits * 5);

  // 4) Relevance to Informado: max 20
  let relevanceScore = 0;
  if (topics.includes("payments")) relevanceScore += 8;
  if (topics.includes("markets") || topics.includes("world")) relevanceScore += 4;
  if (topics.includes("regulation") || topics.includes("risk")) relevanceScore += 4;
  if (topics.includes("banks") || topics.includes("transaction-banking") || topics.includes("digital-assets")) relevanceScore += 3;
  if (topics.includes("strategy") || topics.includes("business") || topics.includes("ai")) relevanceScore += 2;
  relevanceScore = Math.min(20, relevanceScore);

  // 5) Corroboration: max 10
  const corroboration = Number(story.corroboration || 1);
  const corroborationScore = corroboration >= 3 ? 10 : corroboration === 2 ? 6 : 0;

  // De-prioritize formats that are usually less urgent for the daily brief.
  const noisePenalty = /\bopinion\b|\bpodcast\b|\btranscript\b|\bcareer\b|\bjob\b/.test(text) ? 8 : 0;

  return Math.max(0, Math.min(100, Math.round(
    sourceScore + recencyScore + impactScore + relevanceScore + corroborationScore - noisePenalty
  )));
}

function classifyPaymentPillar(story, topics) {
  if (!topics.includes("payments")) return null;

  const text = textFor(story);

  if (/operations|operational|outage|fraud|compliance|sanctions|cyber|exception|reconciliation|investigation|resilience|servicing|stp/.test(text)) {
    return "operations";
  }

  if (/infrastructure|network|rail|clearing|settlement|swift|fednow|rtp|iso 20022|liquidity|messaging|correspondent|ledger|interoperability|instant payment/.test(text)) {
    return "infrastructure";
  }

  if (/acquisition|acquire|merger|m&a|partnership|joint venture|strategy|restructur|divest|expansion|stake|investment|business model|competitive/.test(text)) {
    return "strategy";
  }

  return "general";
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
    section: topics.includes("payments") ? "payments" : "watching",
    paymentPillar: classifyPaymentPillar(item, topics),
    age: recencyLabel(item.pubDate)
  };
}

function periodMatches(story) {
  const hours = ageHours(story.pubDate);

  // Distinct catch-up windows:
  // Today: latest 30 hours
  // 7 Days: older than Today, up to 7 days
  // 30 Days: older than 7 days, up to 30 days
  if (selectedPeriod === "today") return hours <= 30;
  if (selectedPeriod === "7d") return hours > 30 && hours <= 24 * 7;
  return hours > 24 * 7 && hours <= 24 * 30;
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
  const tierLabel =
    story.sourceTier === "T1" ? "Tier 1" :
    story.sourceTier === "T2" ? "Tier 2" :
    story.sourceTier || "";

  const sourceRole =
    story.sourceKind === "primary"
      ? "Official"
      : story.sourceTier === "T2"
        ? "Specialist"
        : "News";

  const parts = [
    story.feedName,
    tierLabel,
    sourceRole,
    story.age
  ];

  if (story.linkMode === "indexed") parts.push("Headline");
  if (Number(story.corroboration || 1) > 1) parts.push(`${story.corroboration} sources`);

  return parts.filter(Boolean).map(escapeHtml).join(" · ");
}

function plainSourceText(value = "") {
  return cleanText(
    String(value)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;|&rsquo;/gi, "'")
      .replace(/&ldquo;|&rdquo;/gi, '"')
      .replace(/&ndash;/gi, "–")
      .replace(/&mdash;/gi, "—")
  );
}

function smartTrim(text, maxLength = 340) {
  const value = cleanText(text);
  if (value.length <= maxLength) return value;

  const clipped = value.slice(0, maxLength + 1);
  const lastSentence = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? ")
  );

  if (lastSentence > maxLength * 0.55) {
    return clipped.slice(0, lastSentence + 1).trim();
  }

  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

function headlineTakeaway(story) {
  if (story.section === "payments") {
    if (story.paymentPillar === "infrastructure") {
      return "Headline-only signal: a Payments infrastructure development that may affect rails, settlement, messaging or interoperability. Open the source for full context.";
    }

    if (story.paymentPillar === "operations") {
      return "Headline-only signal: a Payments operations development with potential implications for controls, resilience, fraud or execution. Open the source for full context.";
    }

    if (story.paymentPillar === "strategy") {
      return "Headline-only signal: a Payments strategy development that may affect competitive positioning, partnerships or investment priorities. Open the source for full context.";
    }

    return "Headline-only signal: a Payments development ranked for executive attention. Open the source for full context.";
  }

  if (story.topics.includes("markets")) {
    return "Headline-only signal: a markets or macro development with potential implications for rates, liquidity, valuations or client activity. Open the source for full context.";
  }

  if (story.topics.includes("world")) {
    return "Headline-only signal: a geopolitical development that may create second-order effects for markets, trade or financial institutions. Open the source for full context.";
  }

  if (story.topics.includes("ai")) {
    return "Headline-only signal: a technology or AI development that may affect investment, competition or operating models. Open the source for full context.";
  }

  if (story.topics.includes("strategy") || story.topics.includes("business")) {
    return "Headline-only signal: a corporate development with possible competitive, investment or industry implications. Open the source for full context.";
  }

  return "Headline-only signal ranked for executive attention. Open the source for the full context and supporting detail.";
}

function executiveBriefFor(story) {
  const description = plainSourceText(story.description || "");

  if (description.length >= 45) {
    return {
      label: "Executive brief",
      text: smartTrim(description, 360),
      headlineOnly: false
    };
  }

  return {
    label: "Executive takeaway",
    text: headlineTakeaway(story),
    headlineOnly: true
  };
}

function whyItMatters(story) {
  const text = textFor(story);

  if (/stablecoin|tokenized|tokenised|deposit token|digital dollar|cbdc/.test(text)) {
    return "Tokenized money is moving closer to mainstream financial infrastructure, with implications for settlement, liquidity, treasury and cross-border payment models.";
  }

  if (/agentic|ai agent|agentic commerce/.test(text) && story.topics.includes("payments")) {
    return "Agentic commerce could change how payments are initiated, authenticated and controlled, creating new opportunities as well as fraud and liability questions.";
  }

  if (/cross-border|remittance|correspondent banking|alipay\+|upi|pix/.test(text) && story.topics.includes("payments")) {
    return "Cross-border payment economics and interoperability remain major competitive battlegrounds for banks, networks and fintechs.";
  }

  if (/swift|iso 20022|clearing|settlement|fednow|real-time payment|instant payment|rtp|payment rail/.test(text)) {
    return "Changes to payment rails or messaging can alter interoperability, liquidity needs, operating processes and the sequencing of bank technology roadmaps.";
  }

  if (/fraud|cyber|scam|breach|outage|resilience|compliance|sanction/.test(text)) {
    return "The development may affect control design, fraud losses, compliance obligations or operational resilience.";
  }

  if (/regulation|regulator|fca|occ|cfpb|rule|law|antitrust/.test(text)) {
    return "Regulatory change can reshape product economics, compliance requirements and the speed at which financial institutions can execute.";
  }

  if (/interest rate|inflation|fed|central bank|oil|bond|yield|currency|dollar|recession/.test(text)) {
    return "Macro and market shifts can change funding costs, liquidity, valuations and transaction activity across financial institutions and clients.";
  }

  if (/tariff|trade war|war|sanction|geopolit|iran|ukraine|china/.test(text)) {
    return "Geopolitical shifts can quickly transmit into markets, trade flows, sanctions exposure and financial-institution risk.";
  }

  if (/acquisition|acquire|merger|m&a|partnership|joint venture|investment|stake|divest/.test(text)) {
    return "This may change competitive positioning, partnership options or the build-versus-buy assumptions of firms in the sector.";
  }

  if (/artificial intelligence|openai|anthropic|ai |agentic|automation|chip|semiconductor/.test(text)) {
    return "The development may influence technology investment, productivity, competitive advantage and future operating models.";
  }

  if (story.section === "payments") {
    return "The item may influence Payments strategy, client propositions, infrastructure choices or operating priorities.";
  }

  return angleFor(story);
}

function executiveBriefBlock(story) {
  const brief = executiveBriefFor(story);
  const why = whyItMatters(story);

  return `
    <div class="executive-brief ${brief.headlineOnly ? "headline-only" : ""}">
      <span class="brief-label">${escapeHtml(brief.label)}</span>
      <p class="brief-text">${escapeHtml(brief.text)}</p>
    </div>

    <div class="why-desktop">
      <span class="brief-label">Why it matters</span>
      <p class="why-text">${escapeHtml(why)}</p>
    </div>

    <details class="why-mobile">
      <summary>Why it matters</summary>
      <p>${escapeHtml(why)}</p>
    </details>
  `;
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
  if (story.section === "payments") {
    if (story.paymentPillar === "infrastructure") return "Review Payments roadmap dependencies and sequencing.";
    if (story.paymentPillar === "operations") return "Assess Payments controls, process and execution exposure.";
    if (story.paymentPillar === "strategy") return "Revisit Payments competitive and investment assumptions.";
    return "Assess product, client and network implications for Payments.";
  }

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
        <span class="score">Priority ${story.score}/100</span>
      </div>

      <h3>
        <a class="story-link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(story.title)}
        </a>
      </h3>

      <p class="meta">${sourceMetaLine(story)}</p>

      ${executiveBriefBlock(story)}

      <div class="impact-grid single">
        <div class="impact-box">
          <strong>Decision angle</strong>
          <span>${escapeHtml(decisionFor(story))}</span>
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
        <span class="score">Priority ${story.score}/100</span>
      </div>

      <h3>
        <a class="story-link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(story.title)}
        </a>
      </h3>

      <p class="meta">${sourceMetaLine(story)}</p>

      ${executiveBriefBlock(story)}

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

function renderPayments() {
  const container = document.getElementById("paymentsList");

  if (!stories.length) {
    container.innerHTML = `<div class="empty-state loading">Loading live sources…</div>`;
    return;
  }

  let filtered = getFilteredStories()
    .filter(story => story.section === "payments");

  if (selectedPaymentPillar !== "all") {
    filtered = filtered.filter(story => story.paymentPillar === selectedPaymentPillar);
  }

  filtered = filtered.slice(0, 10);

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">No Payments items matched this pillar and filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(compactCard).join("");
}

function renderSection(section, elementId) {
  const container = document.getElementById(elementId);

  if (!stories.length) {
    container.innerHTML = `<div class="empty-state loading">Loading live sources…</div>`;
    return;
  }

  const filtered = getFilteredStories()
    .filter(story => story.section === section)
    .slice(0, 10);

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
  renderPayments();
  renderSection("watching", "watchingList");
  updateSourceStatus();
}

async function loadNews() {
  try {
    sourceStatus.classList.remove("error", "partial");
    sourceStatusText.textContent = "Sources · connecting…";

    const response = await fetch("/api/news", {
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
      "watchingList"
    ].forEach(id => {
      document.getElementById(id).innerHTML =
        `<div class="empty-state">Could not load the live sources. Please refresh and try again.</div>`;
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

paymentPillarButtons.forEach(button => {
  button.addEventListener("click", () => {
    paymentPillarButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedPaymentPillar = button.dataset.pillar;
    renderPayments();
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
