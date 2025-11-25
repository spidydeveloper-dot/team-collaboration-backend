const express = require("express");
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const {
  createProjectSchema,
  updateProjectSchema,
} = require("../validators/projectValidator");
const { validateRequest } = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const { authorize, ROLES } = require("../middleware/roleMiddleware");

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(getProjects)
  .post(
    authorize(ROLES.ADMIN, ROLES.MANAGER),
    validateRequest(createProjectSchema),
    createProject
  );

router
  .route("/:id")
  .put(
    authorize(ROLES.ADMIN, ROLES.MANAGER),
    validateRequest(updateProjectSchema),
    updateProject
  )
  .delete(authorize(ROLES.ADMIN), deleteProject);

module.exports = router;
