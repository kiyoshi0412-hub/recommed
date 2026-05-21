import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompanyForm from "@/components/admin/CompanyForm";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseInt(id, 10);
  if (isNaN(companyId)) notFound();
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-4 flex items-center gap-3">
        <Link href="/admin/companies" className="text-gray-400 hover:text-white text-sm">← 企業一覧</Link>
        <h1 className="text-lg font-bold">企業を編集</h1>
      </header>
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <CompanyForm
            initialData={{
              id: company.id,
              name: company.name,
              industry: company.industry ?? "",
              description: company.description ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
