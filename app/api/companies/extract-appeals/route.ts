import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 採用情報に関連するキーワード（優先度高いページを判別するため）
const RECRUIT_KEYWORDS = [
  "recruit", "career", "job", "採用", "求人", "募集", "キャリア",
  "働く", "仕事", "社員", "スタッフ", "待遇", "給与", "福利厚生",
  "環境", "職場", "ドライバー", "運転手", "配送",
];

function isInternalLink(href: string, baseUrl: URL): boolean {
  try {
    const url = new URL(href, baseUrl.origin);
    return url.hostname === baseUrl.hostname;
  } catch {
    return false;
  }
}

function scoreUrl(url: string): number {
  const lower = url.toLowerCase();
  return RECRUIT_KEYWORDS.reduce((score, kw) => score + (lower.includes(kw) ? 1 : 0), 0);
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AppealExtractor/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) throw new Error("not html");
  return res.text();
}

function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, [role=navigation]").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function extractInternalLinks(html: string, baseUrl: URL): string[] {
  const $ = cheerio.load(html);
  const links: { url: string; score: number }[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const absolute = new URL(href, baseUrl.href).href;
      if (isInternalLink(href, baseUrl)) {
        links.push({ url: absolute, score: scoreUrl(absolute) + scoreUrl($(el).text()) });
      }
    } catch { /* ignore invalid urls */ }
  });

  // スコア順にソートして重複除去
  const seen = new Set<string>();
  return links
    .sort((a, b) => b.score - a.score)
    .map((l) => l.url)
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

/**
 * ホームページを起点にリンクを辿り、採用関連ページを網羅的に収集する
 * - 最大 MAX_PAGES ページまでクロール
 * - 採用キーワードを含むURLを優先
 * - 1ページあたり最大 MAX_CHARS 文字まで取得
 */
async function crawlSite(startUrl: string): Promise<string> {
  const MAX_PAGES = 8;
  const MAX_CHARS_PER_PAGE = 3000;
  const MAX_TOTAL_CHARS = 16000;

  const baseUrl = new URL(startUrl);
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const results: { url: string; text: string }[] = [];

  while (queue.length > 0 && results.length < MAX_PAGES) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const html = await fetchHtml(url);
      const text = extractTextFromHtml(html).slice(0, MAX_CHARS_PER_PAGE);
      results.push({ url, text });

      // 最初のページのみリンクを収集してキューに追加
      if (results.length === 1) {
        const links = extractInternalLinks(html, baseUrl);
        links.forEach((link) => {
          if (!visited.has(link)) queue.push(link);
        });
      }
    } catch {
      // 取得失敗はスキップ
    }
  }

  // 結果を結合（上限文字数まで）
  let combined = "";
  for (const { url, text } of results) {
    const block = `[${url}]\n${text}\n\n`;
    if (combined.length + block.length > MAX_TOTAL_CHARS) break;
    combined += block;
  }

  return combined;
}

async function fetchPageText(url: string): Promise<string> {
  const html = await fetchHtml(url);
  return extractTextFromHtml(html).slice(0, 8000);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { homepageUrl, jobSiteUrl, csvText } = body as {
    homepageUrl?: string;
    jobSiteUrl?: string;
    csvText?: string;
  };

  if (!homepageUrl && !jobSiteUrl && !csvText) {
    return NextResponse.json({ error: "最低1つの情報を入力してください" }, { status: 400 });
  }

  const sources: string[] = [];

  if (homepageUrl) {
    try {
      // ホームページはリンクを辿って網羅的に収集
      const text = await crawlSite(homepageUrl);
      sources.push(`【採用ホームページ（複数ページ収集済み）(${homepageUrl})】\n${text}`);
    } catch {
      return NextResponse.json(
        { error: `採用ホームページの取得に失敗しました: ${homepageUrl}` },
        { status: 400 }
      );
    }
  }

  if (jobSiteUrl) {
    try {
      // 転職サイトは単一ページのみ（外部サイトのため深掘りしない）
      const text = await fetchPageText(jobSiteUrl);
      sources.push(`【転職サイト求人情報 (${jobSiteUrl})】\n${text}`);
    } catch {
      return NextResponse.json(
        { error: `転職サイトの取得に失敗しました: ${jobSiteUrl}` },
        { status: 400 }
      );
    }
  }

  if (csvText) {
    sources.push(`【自社求人CSVデータ】\n${csvText.slice(0, 4000)}`);
  }

  const prompt = `あなたはドライバー人材紹介のキャリアアドバイザーのアシスタントです。
以下の情報から、求職者（物流ドライバー）に魅力的な訴求ポイントを抽出してください。

${sources.join("\n\n")}

---

以下のカテゴリに分類して、訴求ポイントをJSON形式で出力してください。
カテゴリ: 「給与・待遇」「職場環境」「待遇」「キャリア」「その他」

出力形式（JSON配列のみ、説明文は不要）:
[
  { "category": "給与・待遇", "content": "具体的な訴求内容", "priority": 1 },
  { "category": "職場環境", "content": "具体的な訴求内容", "priority": 2 }
]

ルール:
- 1カテゴリにつき最大3件まで
- 合計8件以内
- 数字・具体的な条件を含む内容を優先する
- 求職者が「応募したい」と思えるような表現に整える
- priorityは重要度順（1が最重要）`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "訴求ポイントの抽出に失敗しました" }, { status: 500 });
  }

  const appealPoints = JSON.parse(jsonMatch[0]);
  return NextResponse.json({ appealPoints });
}
