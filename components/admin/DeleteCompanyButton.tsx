"use client";
import { useRouter } from "next/navigation";

export default function DeleteCompanyButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`「${name}」を削除してよろしいですか？`)) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium"
    >
      削除
    </button>
  );
}
