import express from "express";
import type { AuthService } from "./service.js";
import { loginRequestSchema, registerRequestSchema } from "./dto.js";
import { createGuardMiddleware } from "../core/guard.js";
import { UnauthorizedError } from "../core/error.js";

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  async register(req: express.Request, res: express.Response) {
    const payload = registerRequestSchema.parse(req.body);
    await this.service.register(payload);
    res.status(200).json({ success: true });
  }

  async login(req: express.Request, res: express.Response) {
    const payload = loginRequestSchema.parse(req.body);
    const success = await this.service.login(payload);

    if (!success) {
      throw new UnauthorizedError("Password not match");
    }

    req.session.email = payload.email;
    res.status(200).json({
      success,
    });
  }

  async state(req: express.Request, res: express.Response) {
    const result = await this.service.state(req.session.email);
    res.status(200).json(result);
  }

  async logout(req: express.Request, res: express.Response) {
    req.session.email = undefined;
    res.status(200).json({
      success: true,
    });
  }

  createRouter(): express.Router {
    const router = express.Router();

    const guard = createGuardMiddleware(false);
    router.post("/register", guard, this.register.bind(this));
    router.post("/login", guard, this.login.bind(this));
    router.get("/state", this.state.bind(this));
    router.post("/logout", createGuardMiddleware(true), this.logout.bind(this));

    return router;
  }
}
