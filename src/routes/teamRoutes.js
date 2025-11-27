const express = require("express");
const router = express.Router();
const { createTeam } = require("../controllers/teamController");
const { createTeamSchema } = require("../validators/teamValidator");
const { validateRequest } = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const { authorize, ROLES } = require("../middleware/roleMiddleware");

router.use(protect);

router.post(
  "/",
  authorize(ROLES.ADMIN),
  validateRequest(createTeamSchema),
  createTeam
);

module.exports = router;
