const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const { successResponse } = require("../utils/responseHandler");
const { NotFoundError, ForbiddenError } = require("../utils/errorTypes");
const { HTTP_STATUS } = require("../config/constants");

// @desc    Get all tasks for a project
// @route   GET /api/tasks?projectId=xxx
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      const tasks = await Task.find()
        .populate("projectId", "name")
        .populate("assignedTo", "name email");
      return successResponse(
        res,
        HTTP_STATUS.OK,
        "Tasks retrieved successfully",
        { tasks }
      );
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Verify user belongs to project's team
    if (req.user.teamId.toString() !== project.teamId.toString()) {
      throw new ForbiddenError(
        "You do not have access to this project's tasks"
      );
    }

    const tasks = await Task.find({ projectId })
      .populate("projectId", "name")
      .populate("assignedTo", "name email");

    successResponse(res, HTTP_STATUS.OK, "Tasks retrieved successfully", {
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, projectId, assignedTo } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Verify user belongs to project's team
    if (req.user.teamId.toString() !== project.teamId.toString()) {
      throw new ForbiddenError(
        "You can only create tasks in your team's projects"
      );
    }

    // Verify assignee belongs to same team (if provided)
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (
        !assignee ||
        assignee.teamId.toString() !== project.teamId.toString()
      ) {
        throw new ForbiddenError("Cannot assign task to user outside the team");
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      projectId,
      assignedTo,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("projectId", "name")
      .populate("assignedTo", "name email");

    // Emit task creation to team room
    const io = req.app.get("io");
    if (io) {
      io.to(`team:${project.teamId}`).emit("task-updated", populatedTask);
    }

    successResponse(res, HTTP_STATUS.CREATED, "Task created successfully", {
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    let task = await Task.findById(id).populate("projectId");
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    // Verify user belongs to task's team
    const project = await Project.findById(task.projectId._id);
    if (req.user.teamId.toString() !== project.teamId.toString()) {
      throw new ForbiddenError(
        "You can only update tasks in your team's projects"
      );
    }

    // Verify assignee belongs to same team (if updating assignee)
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (
        !assignee ||
        assignee.teamId.toString() !== project.teamId.toString()
      ) {
        throw new ForbiddenError("Cannot assign task to user outside the team");
      }
    }

    task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("projectId", "name")
      .populate("assignedTo", "name email");

    // Emit task update to team room
    const io = req.app.get("io");
    if (io) {
      io.to(`team:${project.teamId}`).emit("task-updated", task);
    }

    successResponse(res, HTTP_STATUS.OK, "Task updated successfully", { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate("projectId");
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    // Verify user belongs to task's team
    const project = await Project.findById(task.projectId._id);
    if (req.user.teamId.toString() !== project.teamId.toString()) {
      throw new ForbiddenError(
        "You can only delete tasks in your team's projects"
      );
    }

    await Task.findByIdAndDelete(id);

    successResponse(res, HTTP_STATUS.OK, "Task deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
