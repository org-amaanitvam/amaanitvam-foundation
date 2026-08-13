import { ForbiddenError } from "../shared/errors/AppError.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError("Not authenticated", "USER_UNAUTHORIZED");
      }

      const userRole = req.user.role;

      if (!userRole) {
        throw new ForbiddenError("Role not assigned", "USER_UNAUTHORIZED");
      }

      if (userRole === "super_admin") {
        return next();
      }

      if (!roles.includes(userRole)) {
        throw new ForbiddenError(
          `Role ${userRole} is not authorized to access this resource`,
          "USER_UNAUTHORIZED"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeStrict = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError("Not authenticated", "USER_UNAUTHORIZED");
      }

      const userRole = req.user.role;

      if (!userRole) {
        throw new ForbiddenError("Role not assigned", "USER_UNAUTHORIZED");
      }

      if (!roles.includes(userRole)) {
        throw new ForbiddenError(
          `Role ${userRole} is not authorized to access this resource`,
          "USER_UNAUTHORIZED"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};