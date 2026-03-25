import { NotFoundError } from "../core/error.js";
import { Prisma, type PrismaClient } from "../generated/prisma/client.js";
import type { ListQuery, UpdateRequest } from "./dto.js";

export class NoteService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async add(email: string, request: UpdateRequest): Promise<number> {
    const newNote = await this.prisma.note.create({
      data: {
        title: request.title,
        body: request.body,
        user: {
          connect: {
            email: email,
          },
        },
      },
      select: {
        id: true,
      },
    });
    return newNote.id;
  }

  async list(email: string, query: ListQuery) {
    const where: Prisma.NoteWhereInput = {
      user: {
        email: email,
      },
    };
    where.archived = query.archived == true;
    if (query.q) {
      where.OR = [
        {
          title: {
            contains: query.q,
          },
        },
        {
          body: {
            contains: query.q,
          },
        },
      ];
    }
    const notes = await this.prisma.note.findMany({
      where: where,
      omit: {
        userId: true,
        archived: true,
      },
    });
    return notes;
  }

  async getById(email: string, id: number) {
    const note = await this.prisma.note.findUnique({
      where: {
        id: id,
        user: {
          email: email,
        },
      },
      omit: {
        userId: true,
      },
    });
    if (!note) {
      throw new NotFoundError("Note not found");
    }
    return note;
  }

  async update(email: string, id: number, request: UpdateRequest) {
    try {
      await this.prisma.note.update({
        where: {
          id: id,
          user: {
            email: email,
          },
        },
        data: {
          title: request.title,
          body: request.body,
        },
        select: {
          id: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new NotFoundError("Note not found");
        }
      }
      throw e;
    }
  }

  async patchArchived(email: string, id: number, archived: boolean) {
    try {
      await this.prisma.note.update({
        where: {
          id: id,
          user: {
            email: email,
          },
        },
        data: {
          archived: archived,
        },
        select: {
          id: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new NotFoundError("Note not found");
        }
      }
      throw e;
    }
  }

  async delete(email: string, id: number) {
    try {
      await this.prisma.note.delete({
        where: {
          id: id,
          user: {
            email: email,
          },
        },
        select: {
          id: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new NotFoundError("Note not found");
        }
      }
      throw e;
    }
  }
}
