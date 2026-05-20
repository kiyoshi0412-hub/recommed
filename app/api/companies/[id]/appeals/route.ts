import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appeals = await prisma.appealPoint.findMany({
    where: { companyId: Number(id) },
    orderBy: { priority: "asc" },
  });
  return NextResponse.json(appeals);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const appeal = await prisma.appealPoint.create({
    data: {
      companyId: Number(id),
      category: body.category,
      content: body.content,
      priority: body.priority ?? 0,
    },
  });
  return NextResponse.json(appeal, { status: 201 });
}
