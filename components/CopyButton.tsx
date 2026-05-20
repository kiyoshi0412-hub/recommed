"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        copied
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {copied ? "コピー済" : "コピー"}
    </button>
  );
}
