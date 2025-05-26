import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear un usuario de ejemplo para asociar las listas
  const user = await prisma.user.upsert({
    where: { email: "example@example.com" },
    update: {},
    create: {
      email: "example@example.com",
      password: "hashed_password", // Cambiar por un hash real
      username: "exampleuser",
      birthdate: new Date("2000-01-01"),
      profile: {
        create: {
          bio: "Usuario de ejemplo",
        },
      },
    },
  });

  // Crear las listas predeterminadas
  const defaultLists = [
    { name: "Quiero Leer" },
    { name: "Leyendo Actualmente" },
    { name: "Leídos" },
  ];

  for (const list of defaultLists) {
    await prisma.bookList.upsert({
      where: { name_userId: { name: list.name, userId: user.id } },
      update: {},
      create: {
        name: list.name,
        userId: user.id,
      },
    });
  }

  console.log("Listas predeterminadas creadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
