const express = require("express");
const {
  boardcastNotification,
} = require("../controllers/thirdPartyController");
const router = express.Router();

router.post("/api/send-notification", boardcastNotification);

module.exports = router;
