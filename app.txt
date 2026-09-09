const stories = [
  {
    id: 1,
    topic: "payments",
    region: "us",
    period: ["today", "7d", "30d"],
    section: "mustKnow",
    score: 91,
    source: "Federal Reserve / industry sources",
    age: "18m",
    title: "Real-time payments infrastructure update reshapes bank roadmap priorities",
    summary: "A material infrastructure change could affect investment sequencing, interoperability and cross-border strategy.",
    financial: "Cost ↓ / Revenue opportunity ↑",
    decision: "Review RTP roadmap and investment priorities",
    angle: "High relevance to US; watch spillover to Canada"
  },
  {
    id: 2,
    topic: "payments",
    region: "canada",
    period: ["today", "7d", "30d"],
    section: "strategy",
    score: 84,
    source: "Industry sources",
    age: "1h",
    title: "Canadian payments modernization moves closer to the next strategic milestone",
    summary: "The signal matters for banks evaluating product sequencing, client migration and operating-model readiness."
  },
  {
    id: 3,
    topic: "payments",
    region: "all",
    period: ["today", "7d", "30d"],
    section: "infrastructure",
    score: 82,
    source: "Network / infrastructure sources",
    age: "2h",
    title: "ISO 20022 adoption is shifting from migration work to data-value execution",
    summary: "Institutions are moving from compliance delivery toward richer data, automation and straight-through processing."
  },
  {
    id: 4,
    topic: "risk",
    region: "us",
    period: ["today", "7d", "30d"],
    section: "operations",
    score: 79,
    source: "Regulatory / industry sources",
    age: "3h",
    title: "Payment fraud controls are becoming a core operating-model issue",
    summary: "The operational question is no longer only prevention; it is speed of detection, case management and recovery."
  },
  {
    id: 5,
    topic: "fintech",
    region: "all",
    period: ["today", "7d", "30d"],
    section: "watching",
    score: 72,
    source: "Fintech / market sources",
    age: "4h",
    title: "Fintech infrastructure providers continue moving deeper into bank-grade payments",
    summary: "Worth watching for changes in build-vs-buy decisions, vendor concentration and speed to market."
  },
  {
    id: 6,
    topic: "strategy",
    region: "all",
    period: ["7d", "30d"],
    section: "strategy",
    score: 76,
    source: "Corporate sources",
    age: "3d",
    title: "Payments M&A activity keeps shifting toward infrastructure and orchestration",
    summary: "Strategic buyers appear increasingly focused on capabilities that compress implementation time and improve control."
  }
];

const topicSelect = document.getElementById("topicSelect");
const regionSelect = document.getElementById("regionSelect");
const periodButtons = document.querySelectorAll(".period-btn");
const contextLabel = document.getElementById("contextLabel");

let selectedPeriod = "today";

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

function storyMatches(story) {
  const topic = topicSelect.value;
  const region = regionSelect.value;

  const topicOk = topic === "all" || story.topic === topic || (topic === "payments" && ["payments", "risk"].includes(story.topic));
  const regionOk = region === "all" || story.region === "all" || story.region === region;
  const periodOk = story.period.includes(selectedPeriod);

  return topicOk && regionOk && periodOk;
}

function mainCard(story) {
  return `
    <article class="story-card must-know">
      <div class="story-top">
        <span class="badge">🔥 MUST KNOW</span>
        <span class="score">${story.score}/100</span>
      </div>
      <h3>${story.title}</h3>
      <p class="meta">${story.source} · ${story.age}</p>
      <p class="summary">${story.summary}</p>

      <div class="impact-grid">
        <div class="impact-box">
          <strong>Financial impact</strong>
          <span>${story.financial || "Potential impact under review"}</span>
        </div>
        <div class="impact-box">
          <strong>Decision angle</strong>
          <span>${story.decision || "Assess strategic implications"}</span>
        </div>
        <div class="impact-box">
          <strong>Your angle</strong>
          <span>${story.angle || "Monitor for relevance to priority markets"}</span>
        </div>
      </div>
    </article>
  `;
}

function compactCard(story) {
  return `
    <article class="story-card">
      <div class="story-top">
        <span class="meta">${story.source} · ${story.age}</span>
        <span class="score">${story.score}</span>
      </div>
      <h3>${story.title}</h3>
      <p class="summary">${story.summary}</p>
    </article>
  `;
}

function renderSection(section, elementId, large = false) {
  const container = document.getElementById(elementId);
  const filtered = stories.filter(story => story.section === section && storyMatches(story));

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">No high-priority items for this filter yet.</div>`;
    return;
  }

  filtered.sort((a, b) => b.score - a.score);
  container.innerHTML = filtered.map(large ? mainCard : compactCard).join("");
}

function render() {
  const topic = topicLabels[topicSelect.value];
  contextLabel.textContent = `${topic} · ${periodLabels[selectedPeriod]}`;

  renderSection("mustKnow", "mustKnowList", true);
  renderSection("strategy", "strategyList");
  renderSection("infrastructure", "infrastructureList");
  renderSection("operations", "operationsList");
  renderSection("watching", "watchingList");
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

render();
