const Project = require("../models/Project");
const Team = require("../models/Team");
const { successResponse } = require("../utils/responseHandler");
const { NotFoundError, ForbiddenError } = require("../utils/errorTypes");
const { HTTP_STATUS } = require("../config/constants");

// @desc    Get all projects for team
// @route   GET /api/projects?teamId=xxx
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { teamId } = req.query;

    if (!teamId) {
      const projects = await Project.find().populate("teamId", "name");
      return successResponse(
        res,
        HTTP_STATUS.OK,
        "Projects retrieved successfully",
        { projects }
      );
    }

    // Verify user belongs to team
    if (req.user.teamId.toString() !== teamId) {
      throw new ForbiddenError(
        "You do not have access to this team's projects"
      );
    }

    const projects = await Project.find({ teamId }).populate("teamId", "name");

    successResponse(res, HTTP_STATUS.OK, "Projects retrieved successfully", {
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/Manager only)
const createProject = async (req, res, next) => {
  try {
    const { name, description, teamId } = req.body;

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    // Verify user belongs to team
    if (req.user.teamId.toString() !== teamId) {
      throw new ForbiddenError(
        "You can only create projects for your own team"
      );
    }

    const project = await Project.create({
      name,
      description,
      teamId,
    });

    const populatedProject = await Project.findById(project._id).populate(
      "teamId",
      "name"
    );

    successResponse(res, HTTP_STATUS.CREATED, "Project created successfully", {
      project: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Manager only)
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    let project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Verify user belongs to project's team
    if (req.user.teamId.toString() !== project.teamId.toString()) {
      throw new ForbiddenError("You can only update projects in your own team");
    }

    project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("teamId", "name");

    successResponse(res, HTTP_STATUS.OK, "Project updated successfully", {
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Verify user belongs to project's team
    if (req.user.teamId.toString() !== project.teamId.toString()) {
      throw new ForbiddenError("You can only delete projects in your own team");
    }

    await Project.findByIdAndDelete(id);

    successResponse(res, HTTP_STATUS.OK, "Project deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
