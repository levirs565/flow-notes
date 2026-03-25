import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import argon2 from "argon2";
import type { LoginRequest, RegisterRequest } from "./dto.js";

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async register(request: RegisterRequest): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          name: request.name,
          email: request.email,
          passwordHash: await argon2.hash(request.password),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new Error("Email already registered");
        }
      }
      throw e;
    }
  }

  async login(request: LoginRequest): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: request.email,
      },
      select: {
        passwordHash: true,
      },
    });

    if (!user) throw new Error("User not found");

    return await argon2.verify(user?.passwordHash, request.password);
  }

  async state(email: string | undefined) {
    if (!email) return null;

    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        email: true,
        name: true,
      },
    });

    return user ?? null;
  }
}
