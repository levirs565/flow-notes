import "dotenv/config";
import express from "express";
import expressSession from "express-session";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";
import { AuthService } from "./auth/service.js";
import { AuthController } from "./auth/controller.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { NoteService } from "./note/service.js";
import { NoteController } from "./note/controller.js";
import { appErrorHandler } from "./core/error.js";

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
const noteService = new NoteService(prisma);

const apiRoute = express.Router();

const authController = new AuthController(authService);
apiRoute.use("/auth", authController.createRouter());

const noteController = new NoteController(noteService);
apiRoute.use("/notes", noteController.createRouter());

apiRoute.get("/status", (req, res) => {
  return res.status(200).json({
    health: true,
  });
});

app.use("/api", apiRoute);
app.use(appErrorHandler);

const port = parseInt(process.env.PORT ?? "8080");
app.listen(port, () => {
  console.log(`Server run at port ${port}`);
});
