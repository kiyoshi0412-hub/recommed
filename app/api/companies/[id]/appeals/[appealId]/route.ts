import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; appealId: string }> }) {
  const { appealId } = await params;
  const body = await req.json();
  const appeal = await prisma.appealPoint.update({
    where: { id: Number(appealId) },
    data: {
      category: body.category,
      content: body.content,
      priority: body.priority ?? 0,
    },
  });
  return NextResponse.json(appeal);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; appealId: string }> }) {
  const { appealId } = await params;
  await prisma.appealPoint.delete({ where: { id: Number(appealId) } });
  return NextResponse.json({ ok: true });
}
