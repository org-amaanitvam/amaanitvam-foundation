import {
  writeAuthAudit,
} from "../modules/auth/authentication.helpers.js";

export const auditDashboardMutation = (action) =>
  (req, res, next) => {
    const startedAt = Date.now();

    res.once("finish", () => {
      void writeAuthAudit({
        req,
        user: req.dbUser || null,
        access: req.userAccess || null,
        action,
        success: res.statusCode < 400,
        metadata: {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs:
            Date.now() - startedAt,
          params: req.params || {},
        },
      });
    });

    next();
  };
