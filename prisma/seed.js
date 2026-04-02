import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = [
  {
    name: "Admin User",
    email: "admin@finance.dev",
    password: "Admin@123",
    role: "ADMIN",
  },
  {
    name: "Analyst User",
    email: "analyst@finance.dev",
    password: "Analyst@123",
    role: "ANALYST",
  },
  {
    name: "Viewer User",
    email: "viewer@finance.dev",
    password: "Viewer@123",
    role: "VIEWER",
  },
];
const categories = [
  "Salary",
  "Rent",
  "Marketing",
  "Operations",
  "Travel",
  "Consulting",
];
const createSeed = (uid) =>
  Array.from({ length: 36 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (i % 6));
    d.setDate((i % 26) + 1);
    const t = i % 3 === 0 ? "EXPENSE" : "INCOME";
    return {
      amount: Number((Math.random() * 5000 + 100).toFixed(2)),
      type: t,
      category: categories[i % categories.length],
      date: d,
      notes: t === "INCOME" ? "Monthly inflow" : "Operational outflow",
      createdById: uid,
    };
  });
const run = async () => {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  const created = [];
  for (const u of users) {
    created.push(
      await prisma.user.create({
        data: { ...u, password: await bcrypt.hash(u.password, 10) },
      }),
    );
  }
  await prisma.financialRecord.createMany({ data: createSeed(created[0].id) });
  console.log("Seed complete");
};
run().finally(async () => prisma.$disconnect());
