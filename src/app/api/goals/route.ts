import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { content, category, targetDate } = await req.json();
  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }
  const goal = await prisma.goal.create({
    data: {
      content,
      category,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      userId: session.user.id,
    },
  });
  return NextResponse.json(goal);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, content, category, done, targetDate } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  const goal = await prisma.goal.update({
    where: { id, userId: session.user.id },
    data: { content, category, done, targetDate: targetDate ? new Date(targetDate) : undefined },
  });
  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  await prisma.goal.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
} 
