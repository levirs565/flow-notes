import express from "express";
import type { NoteService } from "./service.js";
import {
  idParametersSchema,
  listQuerySchema,
  patchArchivedSchema,
  updateRequestSchema,
} from "./dto.js";
import { createGuardMiddleware } from "../core/guard.js";

export class NoteController {
  private service: NoteService;

  constructor(service: NoteService) {
    this.service = service;
  }

  async add(req: express.Request, res: express.Response) {
    const payload = updateRequestSchema.parse(req.body);
    const id = await this.service.add(req.session.email!, payload);
    res.status(201).json({
      id,
    });
  }

  async list(req: express.Request, res: express.Response) {
    const query = listQuerySchema.parse(req.query);
    const notes = await this.service.list(req.session.email!, query);
    res.status(200).json(notes);
  }

  async getById(req: express.Request, res: express.Response) {
    const parameters = idParametersSchema.parse(req.params);
    const note = await this.service.getById(req.session.email!, parameters.id);
    res.status(200).json(note);
  }

  async update(req: express.Request, res: express.Response) {
    const parameters = idParametersSchema.parse(req.params);
    const payload = updateRequestSchema.parse(req.body);

    await this.service.update(req.session.email!, parameters.id, payload);

    res.status(200).json({
      success: true,
    });
  }

  async patchArchived(req: express.Request, res: express.Response) {
    const parameters = idParametersSchema.parse(req.params);
    const payload = patchArchivedSchema.parse(req.body);

    await this.service.patchArchived(
      req.session.email!,
      parameters.id,
      payload.archived,
    );

    res.status(200).json({
      success: true,
    });
  }

  async delete(req: express.Request, res: express.Response) {
    const parameters = idParametersSchema.parse(req.params);

    await this.service.delete(req.session.email!, parameters.id);

    res.status(200).json({
      success: true,
    });
  }

  createRouter(): express.Router {
    const router = express.Router();

    router.use(createGuardMiddleware(true));

    router.post("/", this.add.bind(this));
    router.get("/", this.list.bind(this));
    router.get("/:id", this.getById.bind(this));
    router.put("/:id", this.update.bind(this));
    router.patch("/:id/archive", this.patchArchived.bind(this));
    router.delete("/:id", this.delete.bind(this));

    return router;
  }
}
