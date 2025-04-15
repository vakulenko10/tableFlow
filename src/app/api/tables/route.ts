import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const tables = await prisma.table.findMany();
  return NextResponse.json(tables);
}
