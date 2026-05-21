"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialData?: {
    id?: number;
    name: string;
    area: string;
    industry: string;
    description: string;
  };
};

type ExtractedAppeal = {
  category: string;
  content: string;
  priority: number;
};

const AREAS = ["関東", "関西", "東北", "中部", "九州・沖縄", "北海道", "中国・四国", "北陸・甲信越"];
const INDUSTRIES = ["一般貨物", "冷凍・冷蔵輸送", "宅配・小口配送", "タンクローリー", "重機・建設", "引越し", "その他"];
const CATEGORIES = ["給与・待遇", "職場環境", "待遇", "キャリア", "その他"];

export default function CompanyForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    area: initialData?.area ?? "",
    industry: initialData?.industry ?? "",
    description: initialData?.description ?? "",
  });

  // 訴求ポイント自動抽出
  const [homepageUrl, setHomepageUrl] = useState("");
  const [jobSiteUrl, setJobSiteUrl] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractedAppeals, setExtractedAppeals] = useState<ExtractedAppeal[]>([]);
  const [saving, setSaving] = useState(false);

  const hasSource = homepageUrl || jobSiteUrl || csvFile;

  const handleExtract = async () => {
    setExtracting(true);
    setExtractError("");
    setExtractedAppeals([]);

    let csvText = "";
    if (csvFile) {
      csvText = await csvFile.text();
    }

    const res = await fetch("/api/companies/extract-appeals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homepageUrl: homepageUrl || undefined,
        jobSiteUrl: jobSiteUrl || undefined,
        csvText: csvText || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setExtractError(data.error ?? "抽出に失敗しました");
    } else {
      setExtractedAppeals(data.appealPoints);
    }
    setExtracting(false);
  };

  const handleRemoveAppeal = (index: number) => {
    setExtractedAppeals(extractedAppeals.filter((_, i) => i !== index));
  };

  const handleEditAppeal = (index: number, field: "category" | "content", value: string) => {
    setExtractedAppeals(
      extractedAppeals.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (isEdit) {
      await fetch(`/api/companies/${initialData!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/admin/companies");
    } else {
      // 企業を作成
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const company = await res.json();

      // 抽出済み訴求ポイントがあれば一括登録
      if (extractedAppeals.length > 0) {
        await Promise.all(
          extractedAppeals.map((appeal) =>
            fetch(`/api/companies/${company.id}/appeals`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(appeal),
            })
          )
        );
      }

      router.push(`/admin/companies/${company.id}/appeals`);
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* 企業基本情報 */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          企業基本情報
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="例）山田運輸株式会社"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">エリア</label>
              <select
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
              >
                <option value="">選択</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
              >
                <option value="">選択</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業概要</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              rows={2}
              placeholder="企業の特徴や強みを入力してください"
            />
          </div>
        </div>
      </div>

      {/* 訴求ポイント自動抽出（新規登録時のみ） */}
      {!isEdit && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-1 pb-2 border-b border-gray-100">
            訴求ポイントの自動抽出
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            以下のいずれか1つ以上を入力して「自動抽出」を実行してください
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                採用ホームページURL
              </label>
              <input
                type="url"
                value={homepageUrl}
                onChange={(e) => setHomepageUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="https://example.com/recruit"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                転職サイト求人URL
              </label>
              <input
                type="url"
                value={jobSiteUrl}
                onChange={(e) => setJobSiteUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                placeholder="https://doda.jp/DodaFront/View/JobSearchDetail/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                自社求人CSVデータ
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
              {csvFile && (
                <p className="text-xs text-green-600 mt-1">✓ {csvFile.name}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={!hasSource || extracting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {extracting ? "抽出中..." : "AIで訴求ポイントを自動抽出"}
            </button>

            {extractError && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{extractError}</p>
            )}
          </div>

          {/* 抽出結果プレビュー */}
          {extractedAppeals.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  抽出結果（{extractedAppeals.length}件）
                </p>
                <p className="text-xs text-gray-400">編集・削除できます</p>
              </div>
              <div className="flex flex-col gap-2">
                {extractedAppeals.map((appeal, i) => (
                  <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <select
                        value={appeal.category}
                        onChange={(e) => handleEditAppeal(i, "category", e.target.value)}
                        className="text-xs border border-indigo-200 rounded px-2 py-1 bg-white shrink-0"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveAppeal(i)}
                        className="text-xs text-red-400 hover:text-red-600 ml-auto shrink-0"
                      >
                        削除
                      </button>
                    </div>
                    <textarea
                      value={appeal.content}
                      onChange={(e) => handleEditAppeal(i, "content", e.target.value)}
                      className="w-full mt-2 text-sm text-gray-700 bg-transparent border-none outline-none resize-none leading-relaxed"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving
            ? "保存中..."
            : isEdit
            ? "更新する"
            : extractedAppeals.length > 0
            ? `登録する（訴求${extractedAppeals.length}件も保存）`
            : "登録する"}
        </button>
      </div>
    </form>
  );
}
