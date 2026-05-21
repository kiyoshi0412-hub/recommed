import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { appealPoints: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const company = await prisma.company.create({
    data: {
      name: body.name,
      industry: body.industry ?? null,
      description: body.description ?? null,
    },
  });
  return NextResponse.json(company, { status: 201 });
}
