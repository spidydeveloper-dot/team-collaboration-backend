const Joi = require("joi");

const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Project name must be at least 3 characters",
    "string.max": "Project name cannot exceed 100 characters",
    "any.required": "Project name is required",
  }),
  description: Joi.string().max(500).allow("").optional(),
  teamId: Joi.string().hex().length(24).required().messages({
    "any.required": "Team ID is required",
    "string.length": "Invalid Team ID format",
  }),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).allow("").optional(),
  teamId: Joi.string().hex().length(24).optional(),
}).min(1);

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};
