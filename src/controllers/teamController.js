const Team = require("../models/Team");
const User = require("../models/User");
const { successResponse } = require("../utils/responseHandler");
const { HTTP_STATUS } = require("../config/constants");

const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      adminId: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, { teamId: team._id });

    successResponse(res, HTTP_STATUS.CREATED, "Team created successfully", {
      team,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam };
