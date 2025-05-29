import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password, username, birthdate, favoriteGenres, type } = req.body;
    if (type === "register") {
      // Registro
      if (!email || !password || !username || !birthdate) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }
      try {
        const existingUser = await prisma.user.findFirst({
          where: { OR: [{ email }, { username }] },
        });
        if (existingUser) {
          return res.status(409).json({ error: "El usuario ya existe" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = await prisma.userProfile.create({ data: {} });
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            birthdate: new Date(birthdate),
            profileId: profile.id,
            favoriteGenres: {
              create: (favoriteGenres || []).map((name: string) => ({ name })),
            },
          },
        });

        const defaultLists = [
          "Lo quiero leer",
          "Leyendo actualmente",
          "Leído",
        ];
        await prisma.bookList.createMany({
          data: defaultLists.map((name) => ({ name, userId: user.id })),
        });
        return res.status(201).json({ message: "Usuario registrado" });
      } catch (error) {
        return res.status(500).json({ error: "Error al registrar usuario" });
      }
    } else {
      // Login
      if (!email || !password) {
        return res.status(400).json({ error: "Faltan datos" });
      }
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return res.status(401).json({ error: "Credenciales inválidas" });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return res.status(401).json({ error: "Credenciales inválidas" });
        }
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "7d" });
        return res.status(200).json({ token });
      } catch (error) {
        return res.status(500).json({ error: "Error al iniciar sesión" });
      }
    }
    
  } else if (req.method === "GET") {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No autorizado" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          birthdate: true,
          profile: { select: { bio: true } },
          favoriteGenres: { select: { name: true } },
          bookLists: {
            select: {
              id: true,
              name: true,
              entries: {
                select: {
                  book: {
                    select: {
                      id: true,
                      title: true,
                      authors: true,
                      image: true,
                      description: true,
                      categories: true,
                      averageRating: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      return res.status(200).json(user);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}
