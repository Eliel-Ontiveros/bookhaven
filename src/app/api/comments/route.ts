import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.replace("Bearer ", "");
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/auth`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    if (user && !user.id && user.userId) {
      user.id = user.userId;
    }
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "Falta el parámetro bookId" }, { status: 400 });
  }
  const comments = await prisma.comment.findMany({
    where: { bookId },
    include: { user: { select: { username: true, id: true } } },
    orderBy: { createdAt: "asc" },
  });
  const commentsWithName = comments.map((c) => ({
    ...c,
    user: { name: c.user?.username ?? "Usuario" },
  }));
  return NextResponse.json(commentsWithName);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bookId, content } = body;
  if (!bookId || !content) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  const user = await getUserFromRequest(req);
  if (!user || !user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    book = await prisma.book.create({
      data: {
        id: bookId,
        title: "Libro externo",
        authors: "",
        image: "",
        description: "",
        categories: [],
      },
    });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: user.id,
        bookId,
      },
      include: { user: { select: { username: true, id: true } } },
    });

    return NextResponse.json({
      ...comment,
      user: { name: comment.user?.username ?? "Usuario" },
    });
  } catch (error) {
    console.error("Error al guardar comentario:", error);
    return NextResponse.json({ error: "Error al guardar comentario" }, { status: 500 });
  }
}
