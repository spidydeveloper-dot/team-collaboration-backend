const { ForbiddenError } = require("../utils/errorTypes");
const { ROLES } = require("../config/constants");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError("User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You do not have permission to perform this action")
      );
    }

    next();
  };
};

module.exports = { authorize, ROLES };
