import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteCompanyButton from "@/components/admin/DeleteCompanyButton";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { appealPoints: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← トップ</Link>
          <h1 className="text-lg font-bold">管理画面 / 企業一覧</h1>
        </div>
        <Link
          href="/admin/companies/new"
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 企業を追加
        </Link>
      </header>

      <div className="p-4 max-w-3xl mx-auto">
        {companies.length === 0 && (
          <p className="text-center text-gray-500 py-10">企業が登録されていません</p>
        )}
        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <h2 className="font-bold text-gray-800">{company.name}</h2>
                <div className="flex gap-2 mt-1">
                  {company.area && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{company.area}</span>
                  )}
                  {company.industry && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{company.industry}</span>
                  )}
                  <span className="text-xs text-gray-400">訴求 {company._count.appealPoints}件</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Link
                  href={`/admin/companies/${company.id}/appeals`}
                  className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium"
                >
                  訴求ポイント
                </Link>
                <Link
                  href={`/admin/companies/${company.id}/edit`}
                  className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium"
                >
                  編集
                </Link>
                <DeleteCompanyButton id={company.id} name={company.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
