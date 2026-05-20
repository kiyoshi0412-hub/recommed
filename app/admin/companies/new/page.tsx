import Link from "next/link";
import CompanyForm from "@/components/admin/CompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-4 flex items-center gap-3">
        <Link href="/admin/companies" className="text-gray-400 hover:text-white text-sm">← 企業一覧</Link>
        <h1 className="text-lg font-bold">企業を登録</h1>
      </header>
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <CompanyForm />
        </div>
      </div>
    </div>
  );
}
