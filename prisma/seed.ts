import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 既存データを削除
  await prisma.appealPoint.deleteMany();
  await prisma.company.deleteMany();

  // 企業1: 山田運輸
  const company1 = await prisma.company.create({
    data: {
      name: "山田運輸株式会社",
            industry: "一般貨物",
      description: "首都圏を中心に30年の実績を持つ中堅運送会社。ドライバーの働きやすさを重視した職場環境が特徴。",
      appealPoints: {
        create: [
          { category: "給与・待遇", content: "月収35〜50万円可。歩合給あり。入社3ヶ月は固定給保証で安心してスタートできる。", priority: 1 },
          { category: "職場環境", content: "平均勤続年数12年。ドライバー同士の仲が良く、困ったときに相談しやすい職場。", priority: 2 },
          { category: "キャリア", content: "管理職ポジションへの登用実績多数。大型免許取得支援制度あり（費用全額会社負担）。", priority: 3 },
          { category: "待遇", content: "社会保険完備・退職金制度あり。制服・軍手等の備品は全て会社支給。", priority: 4 },
        ],
      },
    },
  });

  // 企業2: 東西ロジスティクス
  const company2 = await prisma.company.create({
    data: {
      name: "東西ロジスティクス株式会社",
      industry: "冷凍・冷蔵輸送",
      description: "食品・医薬品の冷凍・冷蔵輸送に特化した専門会社。全国ネットワークを持つ成長企業。",
      appealPoints: {
        create: [
          { category: "給与・待遇", content: "基本給25万円〜＋各種手当。冷凍手当・夜間手当など充実。年収500万円以上も可能。", priority: 1 },
          { category: "職場環境", content: "新車導入率が高く、最新の2024年式トラック多数。ドライブレコーダー完備で安心運転。", priority: 2 },
          { category: "待遇", content: "週休2日制（土日休み選択可）。連続勤務上限を社内規定で設定。ドライバーの健康管理を重視。", priority: 3 },
          { category: "キャリア", content: "全国30拠点への転勤・異動も可能。専門性を高めながら全国規模で活躍できる。", priority: 4 },
        ],
      },
    },
  });

  // 企業3: 北斗配送
  const company3 = await prisma.company.create({
    data: {
      name: "北斗配送株式会社",
      industry: "宅配・小口配送",
      description: "東北エリア密着の宅配会社。地域No.1のシェアを誇り、安定した仕事量が魅力。",
      appealPoints: {
        create: [
          { category: "給与・待遇", content: "完全固定給制（月27〜32万円）。歩合なしで安定収入。ボーナス年2回（計3ヶ月分）。", priority: 1 },
          { category: "職場環境", content: "固定ルート配送のため毎日同じコース。土地勘がつき、残業も少なく定時上がり多数。", priority: 2 },
          { category: "待遇", content: "自宅から近い配送センターへの配属優先。引越し不要で働ける可能性が高い。", priority: 3 },
          { category: "キャリア", content: "センター長・エリアマネージャーへのキャリアパスあり。マネジメントを学べる環境。", priority: 4 },
        ],
      },
    },
  });

  console.log("✅ シードデータ作成完了");
  console.log(`  - ${company1.name}`);
  console.log(`  - ${company2.name}`);
  console.log(`  - ${company3.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
