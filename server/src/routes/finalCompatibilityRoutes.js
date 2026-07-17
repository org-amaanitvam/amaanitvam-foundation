import express from 'express';
import * as routeModule0 from "../modules/users/user.routes.js";
import * as routeModule1 from "../modules/candidates/candidate.routes.js";
import * as routeModule2 from "../modules/departments/department.routes.js";

const router = express.Router();

function pickRouter(moduleNamespace, label) {
  const candidates = [
    moduleNamespace.default,
    moduleNamespace.router,
    moduleNamespace.routes,
    moduleNamespace.adminRouter,
    moduleNamespace.authRouter,
    ...Object.values(moduleNamespace),
  ];
  const selected = candidates.find(
    (value) => typeof value === 'function' && typeof value.use === 'function'
  );
  if (!selected) {
    throw new TypeError(`No Express router export found in ${label}`);
  }
  return selected;
}

function mountRewritten(basePath, targetRouter, targetPrefix = '/') {
  router.use(basePath, (req, res, next) => {
    const originalUrl = req.url;
    const suffix = originalUrl === '/' ? '' : originalUrl;
    const normalizedPrefix = targetPrefix === '/' ? '' : targetPrefix.replace(/\/$/, '');
    req.url = `${normalizedPrefix}${suffix}` || '/';
    targetRouter(req, res, (error) => {
      req.url = originalUrl;
      next(error);
    });
  });
}

const profileRouter = pickRouter(routeModule0, "modules/users/user.routes.js");
const candidatesRouter = pickRouter(routeModule1, "modules/candidates/candidate.routes.js");
const settingsRouter = pickRouter(routeModule2, "modules/departments/department.routes.js");
const authRouter = pickRouter(routeModule0, "modules/users/user.routes.js");

// Canonical profile endpoint plus legacy aliases used by AuthContext.
mountRewritten("/profile/me", profileRouter, "/");
mountRewritten("/admin/me", profileRouter, "/");
mountRewritten("/admin/profile", profileRouter, "/");
mountRewritten("/auth/me", profileRouter, "/");

// Candidate management endpoint, including nested IDs/actions.
mountRewritten('/admin/candidates', candidatesRouter, "/");

// Admin settings endpoint.
mountRewritten('/admin/settings', settingsRouter, "/");

router.get('/admin/settings', (_req, res) => {
  res.json({
    success: true,
    settings: {
      orgName: process.env.ORG_NAME || 'Amaanitvam Foundation',
      enable2FA: String(process.env.ENABLE_2FA || 'false').toLowerCase() === 'true',
    },
  });
});

router.get('/public/settings', (_req, res) => {
  res.json({
    success: true,
    settings: {
      orgName: process.env.ORG_NAME || 'Amaanitvam Foundation',
      enable2FA: String(process.env.ENABLE_2FA || 'false').toLowerCase() === 'true',
    },
  });
});

export default router;
