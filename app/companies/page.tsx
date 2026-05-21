import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string }>;
}) {
  const { industry } = await searchParams;

  const companies = await prisma.company.findMany({
    where: { ...(industry ? { industry } : {}) },
    include: { _count: { select: { appealPoints: true } } },
    orderBy: { name: "asc" },
  });

  const allCompanies = await prisma.company.findMany({ select: { industry: true } });
  const industries = [...new Set(allCompanies.map((c) => c.industry).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-blue-200 hover:text-white text-sm">← トップ</Link>
        <h1 className="text-lg font-bold">企業一覧</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {/* フィルター */}
        <form className="flex gap-2 mb-5">
          <select
            name="industry"
            defaultValue={industry ?? ""}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">業種: すべて</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            絞込
          </button>
        </form>

        {/* 企業リスト */}
        <div className="flex flex-col gap-3">
          {companies.length === 0 && (
            <p className="text-center text-gray-500 py-10">該当する企業がありません</p>
          )}
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-gray-800">{company.name}</h2>
                  {company.industry && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {company.industry}
                    </span>
                  )}
                  {company.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{company.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  訴求 {company._count.appealPoints}件
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
