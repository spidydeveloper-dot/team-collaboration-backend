const { ValidationError } = require("../utils/errorTypes");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ValidationError(errors.join(", ")));
    }

    next();
  };
};

module.exports = { validateRequest };
