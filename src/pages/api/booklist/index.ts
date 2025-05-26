import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }
  const token = authHeader.split(" ")[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  switch (req.method) {
    case "GET": {
      try {
        const lists = await prisma.bookList.findMany({
          where: { userId: decoded.userId },
          select: { id: true, name: true },
          orderBy: { id: "asc" },
        });
        return res.status(200).json(lists);
      } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor" });
      }
    }
    case "POST": {
      const { name } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Nombre de lista inválido" });
      }
      const exists = await prisma.bookList.findFirst({
        where: { userId: decoded.userId, name: name.trim() },
      });
      if (exists) {
        return res.status(400).json({ error: "Ya tienes una lista con ese nombre" });
      }
      try {
        const newList = await prisma.bookList.create({
          data: { name: name.trim(), userId: decoded.userId },
        });
        return res.status(200).json(newList);
      } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor" });
      }
    }
    case "PUT": {
      const { bookId, bookListId, title, authors, image, description, categories, averageRating } = req.body;
      if (!bookId || !bookListId || !title || !authors) {
        return res.status(400).json({ error: "Datos incompletos para agregar el libro" });
      }
      const list = await prisma.bookList.findUnique({
        where: { id: bookListId },
        select: { userId: true },
      });
      if (!list || list.userId !== decoded.userId) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta lista" });
      }
      await prisma.book.upsert({
        where: { id: bookId },
        update: {
          title,
          authors,
          image,
          description,
          categories: categories || [],
          averageRating: averageRating !== undefined ? Number(averageRating) : undefined,
        },
        create: {
          id: bookId,
          title,
          authors,
          image,
          description,
          categories: categories || [],
          averageRating: averageRating !== undefined ? Number(averageRating) : undefined,
        },
      });
      const exists = await prisma.bookListEntry.findFirst({
        where: { bookId, bookListId },
      });
      if (exists) {
        return res.status(400).json({ error: "El libro ya está en la lista" });
      }
      await prisma.bookListEntry.create({
        data: { bookId, bookListId },
      });
      return res.status(200).json({ message: "Libro agregado a la lista" });
    }
    case "DELETE": {
      const { bookId, bookListId, deleteList } = req.body;
      if (deleteList) {
        if (!bookListId) {
          return res.status(400).json({ error: "Falta el ID de la lista" });
        }
        const list = await prisma.bookList.findUnique({
          where: { id: bookListId },
          select: { userId: true },
        });
        if (!list || list.userId !== decoded.userId) {
          return res.status(403).json({ error: "No tienes permiso para eliminar esta lista" });
        }
        await prisma.bookListEntry.deleteMany({ where: { bookListId } });
        await prisma.bookList.delete({ where: { id: bookListId } });
        return res.status(200).json({ message: "Lista eliminada" });
      } else {
        if (!bookId || !bookListId) {
          return res.status(400).json({ error: "Datos incompletos para eliminar el libro" });
        }
        const list = await prisma.bookList.findUnique({
          where: { id: bookListId },
          select: { userId: true },
        });
        if (!list || list.userId !== decoded.userId) {
          return res.status(403).json({ error: "No tienes permiso para modificar esta lista" });
        }
        await prisma.bookListEntry.deleteMany({ where: { bookId, bookListId } });
        return res.status(200).json({ message: "Libro eliminado de la lista" });
      }
    }
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Método ${req.method} no permitido`);
  }
}
