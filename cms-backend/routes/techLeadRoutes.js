const express = require("express");
const router = express.Router();
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");
const { Login, Current } = require("../controllers/authController");
const { member_role } = require("../constants/common");
const {
  CreateMaintenanceTask,
  UpdateMaintenanceTask,
} = require("../controllers/technicianlead/maintenanceController");

router.post(
  "/api/create-maintenancetask",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  CreateMaintenanceTask
);
router.put(
  "/api/update-maintenancetask/:task_id",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  UpdateMaintenanceTask
);

//view_reports permission
// router.get("/report", AuthCheck, PermissionCheck("view_reports"), (req, res) => {
//   res.json({ message: "Accessing reports" });
// });

module.exports = router;
