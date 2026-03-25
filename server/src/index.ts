import "dotenv/config";
import express from "express";
import expressSession from "express-session";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";
import { AuthService } from "./auth/service.js";
import { AuthController } from "./auth/controller.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const app = express();

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
    }),
  }),
);
app.use(express.json());

const authService = new AuthService(prisma);

const authController = new AuthController(authService);

app.use("/auth", authController.createRouter());

app.get("/status", (req, res) => {
  return res.status(200).json({
    health: true,
  });
});

const port = parseInt(process.env.PORT ?? "3000");
app.listen(port, () => {
  console.log(`Server run at port ${port}`);
});
