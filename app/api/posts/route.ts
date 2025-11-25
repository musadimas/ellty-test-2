import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "25");

    const posts = await prisma.post.findMany({
      where: {
        parentId: null,
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
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, operation, parentId, authorId, prevResult } = body;

    if (!authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeof value !== "number") {
      return NextResponse.json({ error: "Value must be a number" }, { status: 400 });
    }

    let result: number = value;

    if (parentId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: parentId },
      });

      if (!parentPost) {
        return NextResponse.json({ error: "Parent post not found" }, { status: 404 });
      }

      switch (operation) {
        case "+":
          result = parentPost.result + value;
          break;
        case "-":
          result = parentPost.result - value;
          break;
        case "*":
          result = parentPost.result * value;
          break;
        case "/":
          if (value === 0) {
            return NextResponse.json({ error: "Cannot divide by zero" }, { status: 400 });
          }
          result = parentPost.result / value;
          break;
        default:
          result = value;
      }
    }

    const post = await prisma.post.create({
      data: {
        value,
        operation: operation || null,
        parentId: parentId || null,
        authorId,
        result,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
