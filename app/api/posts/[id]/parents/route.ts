import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { parentId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.parentId) {
      return NextResponse.json({ parents: [] });
    }

    const parents = [];
    let currentParentId: string | null = post.parentId;

    while (currentParentId) {
      const parent: any = await prisma.post.findUnique({
        where: { id: currentParentId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              children: true,
            },
          },
        },
      });

      if (!parent) break;

      parents.push(parent);
      currentParentId = parent.parentId;
    }

    return NextResponse.json({ parents: parents.reverse() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch parent chain" }, { status: 500 });
  }
}
