import { NextRequest, NextResponse } from "next/server";

// Retrieve all posts
export async function GET(request: NextRequest) {
  try {
    // todo: Implement database query to fetch posts
    const posts = [{ id: 1, title: "Sample Post", content: "This is a sample post" }];

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // todo: Validate request body
    // todo: Implement database insertion

    const newPost = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// PATCH - Update an existing post
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // todo: Implement database update

    const updatedPost = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
