"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Appeal = {
  id: number;
  category: string;
  content: string;
  priority: number;
};

const CATEGORIES = ["給与・待遇", "職場環境", "待遇", "キャリア", "その他"];

export default function AppealsManager({
  companyId,
  initialAppeals,
}: {
  companyId: number;
  initialAppeals: Appeal[];
}) {
  const router = useRouter();
  const [appeals, setAppeals] = useState(initialAppeals);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0], content: "" });
  const [editForm, setEditForm] = useState({ category: "", content: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/companies/${companyId}/appeals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, priority: appeals.length }),
    });
    const newAppeal = await res.json();
    setAppeals([...appeals, newAppeal]);
    setForm({ category: CATEGORIES[0], content: "" });
    setShowForm(false);
    router.refresh();
  };

  const handleEdit = (appeal: Appeal) => {
    setEditingId(appeal.id);
    setEditForm({ category: appeal.category, content: appeal.content });
  };

  const handleUpdate = async (id: number) => {
    const res = await fetch(`/api/companies/${companyId}/appeals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, priority: appeals.find((a) => a.id === id)?.priority ?? 0 }),
    });
    const updated = await res.json();
    setAppeals(appeals.map((a) => (a.id === id ? updated : a)));
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この訴求ポイントを削除しますか？")) return;
    await fetch(`/api/companies/${companyId}/appeals/${id}`, { method: "DELETE" });
    setAppeals(appeals.filter((a) => a.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{appeals.length}件登録済み</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + 訴求ポイントを追加
        </button>
      </div>

      {/* 追加フォーム */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">新規追加</h3>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">訴求内容</label>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="訴求ポイントを入力してください"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">
              キャンセル
            </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
              追加する
            </button>
          </div>
        </form>
      )}

      {/* 一覧 */}
      <div className="flex flex-col gap-3">
        {appeals.length === 0 && (
          <p className="text-center text-gray-400 py-10">訴求ポイントが登録されていません</p>
        )}
        {appeals.map((appeal) => (
          <div key={appeal.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {editingId === appeal.id ? (
              <div>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white mb-2"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg text-sm">
                    キャンセル
                  </button>
                  <button onClick={() => handleUpdate(appeal.id)} className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium">
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{appeal.category}</span>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{appeal.content}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(appeal)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                    編集
                  </button>
                  <button onClick={() => handleDelete(appeal.id)} className="text-xs text-red-300 hover:text-red-500 px-2 py-1">
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
