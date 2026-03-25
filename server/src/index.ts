import "dotenv/config";
import express from "express";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const app = express();

app.get("/status", (req, res) => {
  return res.status(200).json({
    health: true,
  });
});

const port = parseInt(process.env.PORT ?? "3000");
app.listen(port, () => {
  console.log(`Server run at port ${port}`);
});
