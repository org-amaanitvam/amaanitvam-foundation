import {
  findMongoUserFromFirebase,
  getOrCreateAccessForExistingUser,
} from "../modules/auth/authentication.helpers.js";

export const requireDashboardAccess = async (req, res, next) => {
  try {
    const user = await findMongoUserFromFirebase(req.user);

    if (!user) {
      return res.status(403).json({
        success: false,
        code: "USER_NOT_REGISTERED",
        message:
          "This authenticated Firebase account is not registered in the dashboard database.",
      });
    }

    const access = await getOrCreateAccessForExistingUser(
      user,
      req.user,
      {
        mustChangePassword: false,
      },
    );

    if (
      !access.isActive ||
      user.status === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
        message: "This account has been deactivated.",
      });
    }

    /*
     * New users are provisioned with mustChangePassword=true.
     *
     * Protected dashboard APIs remain unavailable until the temporary
     * password has been replaced.
     *
     * The first-login password-change endpoint itself does NOT use this
     * middleware, so users can still complete the mandatory password reset.
     */
    if (access.mustChangePassword === true) {
      return res.status(403).json({
        success: false,
        code: "PASSWORD_CHANGE_REQUIRED",
        message:
          "You must change your temporary password before accessing protected dashboard features.",
      });
    }

    req.dbUser = user;
    req.userAccess = access;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles) => {
  const allowed = new Set(allowedRoles);

  return (req, res, next) => {
    if (!req.userAccess) {
      return res.status(500).json({
        success: false,
        message:
          "Dashboard access middleware must run before role middleware.",
      });
    }

    if (!allowed.has(req.userAccess.role)) {
      return res.status(403).json({
        success: false,
        code: "INSUFFICIENT_ROLE",
        message:
          "You do not have permission to perform this action.",
      });
    }

    next();
  };
};
