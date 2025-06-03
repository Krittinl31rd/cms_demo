const express = require("express");
const router = express.Router();
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");
const { Login, Current } = require("../controllers/authController");
const { member_role } = require("../constants/common");

// Technician Lead-only
router.get(
  "/api/techlead-area",
  AuthCheck,
  RoleCheck([member_role.TECHNICIAN_LEAD]),
  (req, res) => {
    res.json({ message: "Welcome Technician Lead" });
  }
);

//view_reports permission
// router.get("/report", AuthCheck, PermissionCheck("view_reports"), (req, res) => {
//   res.json({ message: "Accessing reports" });
// });

module.exports = router;
