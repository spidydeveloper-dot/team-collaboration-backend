const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
const { sendMessageSchema } = require("../validators/messageValidator");
const { validateRequest } = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(getMessages)
  .post(validateRequest(sendMessageSchema), sendMessage);

module.exports = router;
