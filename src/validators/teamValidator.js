const Joi = require("joi");

const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow(""),
});

module.exports = { createTeamSchema };
