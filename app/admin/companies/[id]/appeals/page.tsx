import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppealsManager from "@/components/admin/AppealsManager";

export const dynamic = "force-dynamic";

export default async function AppealsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id: Number(id) },
    include: { appealPoints: { orderBy: { priority: "asc" } } },
  });
  if (!company) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-4 flex items-center gap-3">
        <Link href="/admin/companies" className="text-gray-400 hover:text-white text-sm">← 企業一覧</Link>
        <div>
          <h1 className="text-lg font-bold">訴求ポイント管理</h1>
          <p className="text-xs text-gray-400">{company.name}</p>
        </div>
      </header>
      <div className="p-4 max-w-2xl mx-auto">
        <AppealsManager companyId={company.id} initialAppeals={company.appealPoints} />
      </div>
    </div>
  );
}
