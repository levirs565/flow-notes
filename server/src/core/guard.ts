import express from "express";

export function createGuardMiddleware(loggedIn: boolean): express.Handler {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    if (loggedIn && !req.session.email) {
      res.status(401).json({
        message: "Not logged in",
      });
      return;
    }
    if (!loggedIn && req.session.email) {
      res.status(403).json({
        message: "Only unathorized client can access",
      });
      return;
    }
    next();
  };
}
