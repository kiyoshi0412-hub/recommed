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

const AREAS = ["関東", "関西", "東北", "中部", "九州・沖縄", "北海道", "中国・四国", "北陸・甲信越"];
const INDUSTRIES = ["一般貨物", "冷凍・冷蔵輸送", "宅配・小口配送", "タンクローリー", "重機・建設", "引越し", "その他"];

export default function CompanyForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    area: initialData?.area ?? "",
    industry: initialData?.industry ?? "",
    description: initialData?.description ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isEdit) {
      await fetch(`/api/companies/${initialData!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/admin/companies");
    } else {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const company = await res.json();
      router.push(`/admin/companies/${company.id}/appeals`);
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">エリア</label>
        <select
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
        >
          <option value="">選択してください</option>
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
        <select
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
        >
          <option value="">選択してください</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">企業概要</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          rows={3}
          placeholder="企業の特徴や強みを入力してください"
        />
      </div>
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
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? "保存中..." : isEdit ? "更新する" : "登録して訴求ポイントへ"}
        </button>
      </div>
    </form>
  );
}
