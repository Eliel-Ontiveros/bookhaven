import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { bookId, userId, rating } = await req.json();
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (!bookId || !userIdNum || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    let book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      book = await prisma.book.create({
        data: {
          id: bookId,
          title: 'Desconocido',
          authors: '',
          image: '',
          description: '',
          categories: [],
          averageRating: null,
        },
      });
    }
    const bookRating = await prisma.bookRating.upsert({
      where: { userId_bookId: { userId: userIdNum, bookId } },
      update: { rating },
      create: { userId: userIdNum, bookId, rating },
    });

    const ratings = await prisma.bookRating.findMany({ where: { bookId } });
    const average = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
    await prisma.book.update({
      where: { id: bookId },
      data: { averageRating: average },
    });
    return NextResponse.json({ success: true, average, count: ratings.length });
  } catch (error) {
    console.error('Error en /api/ratings:', error);
    return NextResponse.json({ error: 'Error al guardar la calificación', details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get('bookId');
  const userId = searchParams.get('userId');
  if (!bookId) {
    return NextResponse.json({ error: 'Falta el bookId' }, { status: 400 });
  }
  const ratings = await prisma.bookRating.findMany({ where: { bookId } });
  const average = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0;
  let userRating = null;
  if (userId) {
    const userRatingObj = await prisma.bookRating.findUnique({
      where: { userId_bookId: { userId: parseInt(userId, 10), bookId } },
    });
    userRating = userRatingObj?.rating ?? null;
  }
  return NextResponse.json({ average, count: ratings.length, userRating });
}
