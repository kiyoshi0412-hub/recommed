import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AppealExtractor/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);
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
      const text = await fetchPageText(homepageUrl);
      sources.push(`【採用ホームページ (${homepageUrl})】\n${text}`);
    } catch {
      return NextResponse.json({ error: `採用ホームページの取得に失敗しました: ${homepageUrl}` }, { status: 400 });
    }
  }

  if (jobSiteUrl) {
    try {
      const text = await fetchPageText(jobSiteUrl);
      sources.push(`【転職サイト求人情報 (${jobSiteUrl})】\n${text}`);
    } catch {
      return NextResponse.json({ error: `転職サイトの取得に失敗しました: ${jobSiteUrl}` }, { status: 400 });
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
