import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER = ["給与・待遇", "職場環境", "待遇", "キャリア", "その他"];

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id: Number(id) },
    include: { appealPoints: { orderBy: { priority: "asc" } } },
  });
  if (!company) notFound();

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const points = company.appealPoints.filter((p) => p.category === cat);
      if (points.length > 0) acc[cat] = points;
      return acc;
    },
    {} as Record<string, typeof company.appealPoints>
  );
  const otherCategories = [...new Set(company.appealPoints.map((p) => p.category))].filter(
    (c) => !CATEGORY_ORDER.includes(c)
  );
  otherCategories.forEach((cat) => {
    grouped[cat] = company.appealPoints.filter((p) => p.category === cat);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/companies" className="text-blue-200 hover:text-white text-sm shrink-0">← 一覧</Link>
          <h1 className="text-lg font-bold truncate">{company.name}</h1>
        </div>
        <a
          href={`/api/companies/${company.id}/pdf`}
          download
          className="shrink-0 ml-3 bg-white text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          PDF出力
        </a>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 企業概要 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
          <div className="flex gap-2 mb-2">
            {company.area && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{company.area}</span>
            )}
            {company.industry && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{company.industry}</span>
            )}
          </div>
          {company.description && (
            <p className="text-sm text-gray-600">{company.description}</p>
          )}
        </div>

        {/* 訴求ポイント */}
        <h2 className="text-base font-bold text-gray-700 mb-3">訴求ポイント</h2>
        {Object.entries(grouped).map(([category, points]) => (
          <div key={category} className="mb-4">
            <h3 className="text-xs font-bold text-white bg-blue-500 px-3 py-1 rounded-t-lg inline-block">
              {category}
            </h3>
            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {points.map((point) => (
                <div key={point.id} className="flex items-start gap-3 p-4">
                  <p className="text-sm text-gray-700 flex-1 leading-relaxed">{point.content}</p>
                  <CopyButton text={point.content} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {company.appealPoints.length === 0 && (
          <p className="text-center text-gray-400 py-10">訴求ポイントが登録されていません</p>
        )}
      </div>
    </div>
  );
}
