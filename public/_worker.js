const MAX_AGE_DAYS = 30;
const MAX_ITEMS_PER_FEED = 22;
const MAX_RETURN_ITEMS = 260;

const googleNewsUrl = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-CA&gl=CA&ceid=CA:en`;

const SOURCES = [
  { id: "reuters", name: "Reuters", tier: "T1", kind: "media", connection: "indexed" },
  { id: "wsj", name: "The Wall Street Journal", tier: "T1", kind: "media", connection: "indexed" },
  { id: "ft", name: "Financial Times", tier: "T1", kind: "media", connection: "indexed" },
  { id: "bloomberg", name: "Bloomberg", tier: "T1", kind: "media", connection: "indexed" },
  { id: "cnbc", name: "CNBC", tier: "T2", kind: "media", connection: "indexed" },
  { id: "finextra", name: "Finextra", tier: "T2", kind: "media", connection: "direct" },
  { id: "payments-dive", name: "Payments Dive", tier: "T2", kind: "media", connection: "direct" },
  { id: "the-paypers", name: "The Paypers", tier: "T2", kind: "media", connection: "indexed" },
  { id: "bis", name: "BIS / CPMI", tier: "T1", kind: "primary", connection: "direct" },
  { id: "bank-of-canada", name: "Bank of Canada", tier: "T1", kind: "primary", connection: "direct" },
  { id: "swift", name: "SWIFT", tier: "T1", kind: "primary", connection: "indexed" },
  { id: "jpmorgan", name: "J.P. Morgan Payments", tier: "T1", kind: "primary", connection: "indexed" },
  { id: "mastercard", name: "Mastercard", tier: "T1", kind: "primary", connection: "indexed" },
  { id: "visa", name: "Visa", tier: "T1", kind: "primary", connection: "indexed" },
  { id: "wise", name: "Wise Platform", tier: "T1", kind: "primary", connection: "direct" },
  { id: "payments-canada", name: "Payments Canada", tier: "T1", kind: "primary", connection: "indexed" },
  { id: "iso-20022", name: "ISO 20022", tier: "T1", kind: "primary", connection: "indexed" }
];

const sourceById = Object.fromEntries(SOURCES.map(source => [source.id, source]));

const FEEDS = [
  // Global media: broader candidate collection, then filtering/scoring happens downstream.
  feed("reuters-global", "reuters", googleNewsUrl('site:reuters.com (business OR economy OR markets OR technology OR banking OR payments OR trade OR sanctions OR geopolitics) when:30d')),
  feed("reuters-finance", "reuters", googleNewsUrl('site:reuters.com (payments OR banking OR fintech OR "cross-border" OR stablecoin OR "central bank") when:30d')),
  feed("reuters-regions", "reuters", googleNewsUrl('site:reuters.com (Canada OR "United States" OR Mexico OR Chile OR Brazil) (business OR economy OR banking OR markets) when:30d')),

  feed("wsj-global", "wsj", googleNewsUrl('site:wsj.com (business OR markets OR economy OR banking OR technology OR payments OR trade OR geopolitics) when:30d')),
  feed("wsj-finance", "wsj", googleNewsUrl('site:wsj.com (banks OR fintech OR payments OR "Wall Street" OR "Federal Reserve") when:30d')),
  feed("wsj-tech", "wsj", googleNewsUrl('site:wsj.com (AI OR technology OR chips OR cybersecurity) when:30d')),

  feed("ft-global", "ft", googleNewsUrl('site:ft.com (markets OR economy OR banking OR business OR technology OR payments OR trade OR geopolitics) when:30d')),
  feed("ft-finance", "ft", googleNewsUrl('site:ft.com (banks OR fintech OR payments OR regulation OR "central banks") when:30d')),

  feed("bloomberg-global", "bloomberg", googleNewsUrl('site:bloomberg.com (markets OR economy OR business OR banking OR technology OR payments OR trade OR geopolitics) when:30d')),
  feed("bloomberg-finance", "bloomberg", googleNewsUrl('site:bloomberg.com (banks OR fintech OR payments OR rates OR "central bank") when:30d')),

  feed("cnbc-global", "cnbc", googleNewsUrl('site:cnbc.com (markets OR economy OR business OR technology OR banking OR payments OR trade OR geopolitics) when:30d')),

  // Payments media
  feed("finextra-payments", "finextra", "https://www.finextra.com/rss/channel.aspx?channel=payments", true),
  feed("finextra-wholesale", "finextra", "https://www.finextra.com/rss/channel.aspx?channel=wholesale", true),
  feed("finextra-risk", "finextra", "https://www.finextra.com/rss/channel.aspx?channel=risk", true),
  feed("payments-dive", "payments-dive", "https://www.paymentsdive.com/feeds/news/", true),
  feed("the-paypers", "the-paypers", googleNewsUrl('site:thepaypers.com (payments OR fintech OR banking OR fraud OR "cross-border") when:30d')),

  // Primary sources
  feed("bis", "bis", "https://www.bis.org/doclist/all_pressrels.rss", true),
  feed("bank-of-canada", "bank-of-canada", "https://www.bankofcanada.ca/content_type/press-releases/feed/", true),
  feed("wise", "wise", "https://newsroom.wise.com/en-CEU/press_releases.atom", true),

  feed("swift", "swift", googleNewsUrl('site:swift.com (payments OR "cross-border" OR "ISO 20022" OR settlement OR resilience) when:30d')),
  feed("jpmorgan", "jpmorgan", googleNewsUrl('site:jpmorgan.com (payments OR treasury OR "cross-border" OR "real-time payments" OR Kinexys) when:30d')),
  feed("mastercard", "mastercard", googleNewsUrl('site:mastercard.com (payments OR "Mastercard Move" OR "cross-border" OR stablecoin OR "agentic commerce") when:30d')),
  feed("visa", "visa", googleNewsUrl('site:visa.com (payments OR "cross-border" OR stablecoin OR "agentic commerce" OR tokenization) when:30d')),
  feed("payments-canada", "payments-canada", googleNewsUrl('site:payments.ca (RTR OR Lynx OR payments OR rules OR settlement OR fraud) when:30d')),
  feed("iso-20022", "iso-20022", googleNewsUrl('site:iso20022.org ("ISO 20022" OR payments) when:30d'))
];

function feed(id, sourceId, url, allowSummary = false) {
  const source = sourceById[sourceId];
  return {
    id,
    sourceId,
    name: source.name,
    tier: source.tier,
    kind: source.kind,
    connection: source.connection,
    url,
    allowSummary,
    linkMode: source.connection === "direct" ? "direct" : "indexed"
  };
}

const XML_ENTITY_MAP = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " "
};

function decodeEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => XML_ENTITY_MAP[name.toLowerCase()] ?? match);
}

function stripHtml(value = "") {
  return decodeEntities(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value = "", max = 320) {
  const clean = stripHtml(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function tagText(block, names) {
  for (const name of names) {
    const escaped = name.replace(":", "\\:");
    const regex = new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i");
    const match = block.match(regex);
    if (match) return stripHtml(match[1]);
  }
  return "";
}

function tagRaw(block, names) {
  for (const name of names) {
    const escaped = name.replace(":", "\\:");
    const regex = new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i");
    const match = block.match(regex);
    if (match) return decodeEntities(match[1]).trim();
  }
  return "";
}

function extractLink(block) {
  const rssLink = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  if (rssLink) {
    const value = stripHtml(rssLink[1]);
    if (/^https?:\/\//i.test(value)) return value;
  }

  const atomLink =
    block.match(/<link\b[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i) ||
    block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i);

  if (atomLink && /^https?:\/\//i.test(atomLink[1])) return decodeEntities(atomLink[1]);

  const guid = tagText(block, ["guid"]);
  if (/^https?:\/\//i.test(guid)) return guid;

  return "";
}

function cleanIndexedTitle(title, feed) {
  let clean = String(title || "").trim();

  const suffixes = [
    feed.name,
    "Reuters",
    "reuters.com",
    "The Wall Street Journal",
    "WSJ",
    "Financial Times",
    "Bloomberg",
    "CNBC",
    "Mastercard",
    "Visa",
    "J.P. Morgan",
    "JPMorgan",
    "payments.ca",
    "Society for Worldwide Interbank Financial Telecommunication"
  ];

  for (const suffix of suffixes) {
    const escaped = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    clean = clean.replace(new RegExp(`\\s+-\\s+${escaped}\\s*$`, "i"), "").trim();
  }

  return clean;
}

function classifyContentType(feed, title) {
  const text = String(title || "").toLowerCase();

  if (feed.kind === "media") return "news";

  if (/\breport\b|\bstudy\b|\bsurvey\b|\boutlook\b|\bwhite paper\b|\bdiscussion paper\b|\btoolkit\b|\bresearch\b|\breview\b|\bfindings\b|\bindex\b/.test(text)) {
    return "report";
  }

  if (/\bcase study\b|\bguide\b|\bhow\b|\binsight\b|\bperspective\b|\binterview\b|\btrends\b|\btransformation\b|\bexplainer\b|\bwhy\b/.test(text)) {
    return "insight";
  }

  if (/\blaunch\b|\brollout\b|\bintroduc|\bexpand|\bpartnership\b|\bapproval\b|\bmigration\b|\bstandard\b|\bimplementation\b|\bframework\b|\broadmap\b|\bpilot\b|\btest\b|\btrial\b|\bnew rule\b|\bupdate\b|\bupgrade\b|\bsettlement\b/.test(text)) {
    return "update";
  }

  return "official";
}

function parseFeed(xml, feed) {
  const itemBlocks = [
    ...(String(xml).match(/<item\b[\s\S]*?<\/item>/gi) || []),
    ...(String(xml).match(/<entry\b[\s\S]*?<\/entry>/gi) || [])
  ];

  return itemBlocks
    .map((block) => {
      let title = tagText(block, ["title"]);
      const link = extractLink(block);
      const pubDate =
        tagText(block, ["pubDate", "published", "updated", "dc:date"]) ||
        new Date().toISOString();

      const rawDescription = tagRaw(block, [
        "description",
        "summary",
        "content:encoded",
        "content"
      ]);

      if (feed.linkMode === "indexed") title = cleanIndexedTitle(title, feed);

      return {
        id: `${feed.id}:${link || title}`,
        title,
        description: feed.allowSummary ? truncate(rawDescription, 300) : "",
        link,
        pubDate,
        feedName: feed.name,
        sourceTier: feed.tier,
        sourceId: feed.sourceId,
        sourceKind: feed.kind,
        connection: feed.connection,
        linkMode: feed.linkMode,
        contentType: classifyContentType(feed, title)
      };
    })
    .filter(item => item.title && item.link);
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(feed.url, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8",
        "User-Agent": "Informado/3.0"
      },
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const xml = await response.text();
    const items = parseFeed(xml, feed).slice(0, MAX_ITEMS_PER_FEED);

    if (!items.length) throw new Error("Feed returned no readable items");

    return { feed, items };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeTitle(title = "") {
  return String(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function ageDays(dateString) {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return 9999;
  return Math.max(0, (Date.now() - date.getTime()) / 86400000);
}

function isNoise(item) {
  const text = normalizeTitle(item.title);

  if (text.length < 14) return true;

  const noisePatterns = [
    /\bcareers?\b/,
    /\bjobs?\b/,
    /\bjob opening\b/,
    /\bhiring\b/,
    /\bapply now\b/,
    /\bview jobs\b/,
    /\bproduct manager\b/,
    /\bdirector\b.*\bmastercard\b/,
    /\bsenior counsel\b/,
    /\breturn user experience\b/,
    /\bdeveloper(s)?\b/,
    /\bmember list\b/,
    /\bmembership\b/,
    /\bmessage definitions\b/,
    /\bmessages archive\b/,
    /\bdocument centre\b/,
    /\bdocument center\b/,
    /\bapi resources\b/,
    /\bcatalogue of change requests\b/,
    /\bbusiness justification\b/,
    /\bcertification exam\b/,
    /\bcommercial banking\b$/,
    /\bpayment links\b/,
    /\bpasskeys\b.*\bopen finance pay\b/
  ];

  return noisePatterns.some(pattern => pattern.test(text));
}

function significantTokens(title = "") {
  const stop = new Set([
    "the","a","an","and","or","for","of","to","in","on","with","as","at","by",
    "from","is","are","be","its","this","that","new","says","say","after","over"
  ]);

  return normalizeTitle(title)
    .split(" ")
    .filter(token => token.length >= 4 && !stop.has(token));
}

function similarity(a, b) {
  const aSet = new Set(significantTokens(a));
  const bSet = new Set(significantTokens(b));

  if (!aSet.size || !bSet.size) return 0;

  let intersection = 0;
  for (const token of aSet) if (bSet.has(token)) intersection += 1;

  const union = new Set([...aSet, ...bSet]).size;
  return union ? intersection / union : 0;
}

function addCorroboration(items) {
  return items.map((item, index) => {
    const sources = new Set([item.feedName]);

    for (let j = 0; j < items.length; j += 1) {
      if (j === index) continue;
      const other = items[j];
      if (other.feedName === item.feedName) continue;

      const dayGap = Math.abs(new Date(item.pubDate) - new Date(other.pubDate)) / 86400000;
      if (dayGap > 3) continue;

      if (similarity(item.title, other.title) >= 0.42) sources.add(other.feedName);
    }

    return { ...item, corroboration: sources.size };
  });
}

function dedupeFilterAndSort(items) {
  const seen = new Set();

  const filtered = items
    .map(item => ({ ...item, pubDate: validDate(item.pubDate) }))
    .filter(item => item.pubDate)
    .filter(item => ageDays(item.pubDate) <= MAX_AGE_DAYS)
    .filter(item => !isNoise(item))
    .filter(item => {
      const key = normalizeTitle(item.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_RETURN_ITEMS);

  return addCorroboration(filtered);
}

function sourceStatusFromResults(settled, finalItems) {
  return SOURCES.map(source => {
    const feedIndexes = FEEDS
      .map((feedItem, index) => ({ feedItem, index }))
      .filter(entry => entry.feedItem.sourceId === source.id);

    const fulfilled = feedIndexes.filter(entry => settled[entry.index]?.status === "fulfilled");
    const rejected = feedIndexes.filter(entry => settled[entry.index]?.status === "rejected");

    let status = "error";
    if (fulfilled.length === feedIndexes.length && fulfilled.length > 0) status = "active";
    else if (fulfilled.length > 0) status = "partial";

    const errors = rejected
      .map(entry => String(settled[entry.index]?.reason?.message || settled[entry.index]?.reason || "Unknown error"))
      .filter(Boolean);

    return {
      ...source,
      status,
      itemCount: finalItems.filter(item => item.sourceId === source.id).length,
      error: errors.length ? errors[0] : ""
    };
  });
}

async function handleNews() {
  const settled = await Promise.allSettled(FEEDS.map(fetchFeed));

  const rawItems = [];

  settled.forEach(result => {
    if (result.status === "fulfilled") rawItems.push(...result.value.items);
  });

  const items = dedupeFilterAndSort(rawItems);
  const sources = sourceStatusFromResults(settled, items);

  const activeSources = sources.filter(source => source.status === "active").length;
  const partialSources = sources.filter(source => source.status === "partial").length;

  const response = {
    items,
    meta: {
      updatedAt: new Date().toISOString(),
      activeSources,
      partialSources,
      totalSources: sources.length,
      candidateItems: rawItems.length,
      returnedItems: items.length,
      sources
    }
  };

  return new Response(JSON.stringify(response), {
    status: activeSources || partialSources ? 200 : 503,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600"
    }
  });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/news" || url.pathname === "/api/news/") {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { "Allow": "GET" }
        });
      }

      return handleNews();
    }

    return env.ASSETS.fetch(request);
  }
};

