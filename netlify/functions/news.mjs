const googleNewsUrl = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-CA&gl=CA&ceid=CA:en`;

const FEEDS = [
  {
    id: "reuters",
    name: "Reuters",
    tier: "T1",
    url: googleNewsUrl('source:Reuters (payments OR banking OR fintech OR markets OR "cross-border payments")'),
    allowSummary: false,
    linkMode: "indexed"
  },
  {
    id: "finextra-payments",
    name: "Finextra",
    tier: "T2",
    url: "https://www.finextra.com/rss/channel.aspx?channel=payments",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "finextra-wholesale",
    name: "Finextra",
    tier: "T2",
    url: "https://www.finextra.com/rss/channel.aspx?channel=wholesale",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "finextra-risk",
    name: "Finextra",
    tier: "T2",
    url: "https://www.finextra.com/rss/channel.aspx?channel=risk",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "the-paypers",
    name: "The Paypers",
    tier: "T2",
    url: "https://feeds.feedburner.com/thepaypers/cfKW",
    allowSummary: false,
    linkMode: "direct"
  },
  {
    id: "payments-dive",
    name: "Payments Dive",
    tier: "T2",
    url: "https://www.paymentsdive.com/feeds/news/",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "bis",
    name: "BIS / CPMI",
    tier: "T1",
    url: "https://www.bis.org/doclist/all_pressrels.rss",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "bank-of-canada",
    name: "Bank of Canada",
    tier: "T1",
    url: "https://www.bankofcanada.ca/content_type/press-releases/feed/",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "wise",
    name: "Wise Platform",
    tier: "T1",
    url: "https://newsroom.wise.com/en-CEU/press_releases.atom",
    allowSummary: true,
    linkMode: "direct"
  },
  {
    id: "swift",
    name: "SWIFT",
    tier: "T1",
    url: googleNewsUrl('site:swift.com (payments OR "cross-border" OR "ISO 20022" OR settlement)'),
    allowSummary: false,
    linkMode: "indexed"
  },
  {
    id: "jpmorgan",
    name: "J.P. Morgan Payments",
    tier: "T1",
    url: googleNewsUrl('site:jpmorgan.com payments ("cross-border" OR treasury OR "real-time")'),
    allowSummary: false,
    linkMode: "indexed"
  },
  {
    id: "mastercard",
    name: "Mastercard Move",
    tier: "T1",
    url: googleNewsUrl('site:mastercard.com payments ("Mastercard Move" OR cross-border OR stablecoin)'),
    allowSummary: false,
    linkMode: "indexed"
  },
  {
    id: "payments-canada",
    name: "Payments Canada",
    tier: "T1",
    url: googleNewsUrl('site:payments.ca payments (Lynx OR RTR OR rules OR settlement)'),
    allowSummary: false,
    linkMode: "indexed"
  },
  {
    id: "iso-20022",
    name: "ISO 20022",
    tier: "T1",
    url: googleNewsUrl('site:iso20022.org payments "ISO 20022"'),
    allowSummary: false,
    linkMode: "indexed"
  }
];

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

  if (atomLink && /^https?:\/\//i.test(atomLink[1])) {
    return decodeEntities(atomLink[1]);
  }

  const guid = tagText(block, ["guid"]);
  if (/^https?:\/\//i.test(guid)) return guid;

  return "";
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

      if (feed.linkMode === "indexed") {
        const suffix = new RegExp(`\\s+-\\s+${feed.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
        title = title.replace(suffix, "").trim();
      }

      return {
        id: `${feed.id}:${link || title}`,
        title,
        description: feed.allowSummary ? truncate(rawDescription, 300) : "",
        link,
        pubDate,
        feedName: feed.name,
        sourceTier: feed.tier,
        sourceId: feed.id,
        linkMode: feed.linkMode
      };
    })
    .filter((item) => item.title && item.link);
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(feed.url, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8",
        "User-Agent": "Informado/1.0 (+https://informado.netlify.app/)"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const items = parseFeed(xml, feed).slice(0, 12);

    if (!items.length) {
      throw new Error("Feed returned no readable items");
    }

    return {
      feed,
      items
    };
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
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

function dedupeAndSort(items) {
  const seen = new Set();

  return items
    .map((item) => ({
      ...item,
      pubDate: validDate(item.pubDate)
    }))
    .filter((item) => {
      const key = normalizeTitle(item.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

export default async () => {
  const settled = await Promise.allSettled(FEEDS.map(fetchFeed));

  const items = [];
  const failedSources = [];
  let successfulSources = 0;

  settled.forEach((result, index) => {
    const feed = FEEDS[index];

    if (result.status === "fulfilled") {
      successfulSources += 1;
      items.push(...result.value.items);
    } else {
      failedSources.push({
        id: feed.id,
        name: feed.name,
        error: String(result.reason?.message || result.reason || "Unknown error")
      });
    }
  });

  const response = {
    items: dedupeAndSort(items),
    meta: {
      updatedAt: new Date().toISOString(),
      successfulSources,
      totalSources: FEEDS.length,
      failedSources
    }
  };

  return new Response(JSON.stringify(response), {
    status: successfulSources ? 200 : 503,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600"
    }
  });
};
