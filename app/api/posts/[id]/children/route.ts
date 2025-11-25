import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: parentId } = params;

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "25");

    const children = await prisma.post.findMany({
      where: {
        parentId,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: "desc",
      },
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

    let nextCursor: string | undefined = undefined;
    if (children.length > limit) {
      const nextItem = children.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      children,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch children posts" }, { status: 500 });
  }
}
