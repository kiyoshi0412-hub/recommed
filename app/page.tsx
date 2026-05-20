import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          企業訴求ポイント管理
        </h1>
        <p className="text-center text-gray-500 text-sm mb-10">
          ドライバー人材紹介 社内ツール
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/companies"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-4 px-6 rounded-xl transition-colors"
          >
            <div className="text-lg">CA閲覧画面</div>
            <div className="text-sm text-blue-100 mt-1">企業の訴求ポイントを確認する</div>
          </Link>
          <Link
            href="/admin/companies"
            className="block w-full bg-gray-700 hover:bg-gray-800 text-white text-center font-medium py-4 px-6 rounded-xl transition-colors"
          >
            <div className="text-lg">管理画面</div>
            <div className="text-sm text-gray-300 mt-1">企業・訴求ポイントを登録・編集する</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
