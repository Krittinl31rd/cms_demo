const express = require("express");
const router = express.Router();
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");
const { Login, Current } = require("../controllers/authController");
const { member_role } = require("../constants/common");

module.exports = router;
