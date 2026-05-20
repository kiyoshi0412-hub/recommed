import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import CompanyPDF from "@/components/pdf/CompanyPDF";
import { createElement } from "react";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id: Number(id) },
    include: { appealPoints: { orderBy: { priority: "asc" } } },
  });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const outputDate = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(CompanyPDF, { company, outputDate }) as any;
  const buffer = await renderToBuffer(element);

  const filename = encodeURIComponent(`${company.name}_訴求ポイント.pdf`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
