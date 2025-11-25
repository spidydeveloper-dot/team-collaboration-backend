const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const {
  createTaskSchema,
  updateTaskSchema,
} = require("../validators/taskValidator");
const { validateRequest } = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(getTasks)
  .post(validateRequest(createTaskSchema), createTask);

router
  .route("/:id")
  .put(validateRequest(updateTaskSchema), updateTask)
  .delete(deleteTask);

module.exports = router;
