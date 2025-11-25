const Joi = require("joi");
const { TASK_STATUS } = require("../config/constants");

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Task title must be at least 3 characters",
    "string.max": "Task title cannot exceed 200 characters",
    "any.required": "Task title is required",
  }),
  description: Joi.string().max(1000).allow("").optional(),
  status: Joi.string()
    .valid(...Object.values(TASK_STATUS))
    .default(TASK_STATUS.TODO),
  projectId: Joi.string().hex().length(24).required().messages({
    "any.required": "Project ID is required",
    "string.length": "Invalid Project ID format",
  }),
  assignedTo: Joi.string().hex().length(24).allow(null).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).allow("").optional(),
  status: Joi.string()
    .valid(...Object.values(TASK_STATUS))
    .optional(),
  assignedTo: Joi.string().hex().length(24).allow(null).optional(),
}).min(1);

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
