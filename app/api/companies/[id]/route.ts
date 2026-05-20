import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id: Number(id) },
    include: { appealPoints: { orderBy: { priority: "asc" } } },
  });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(company);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const company = await prisma.company.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      area: body.area ?? null,
      industry: body.industry ?? null,
      description: body.description ?? null,
    },
  });
  return NextResponse.json(company);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.company.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
