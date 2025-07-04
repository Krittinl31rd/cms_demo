const express = require("express");
const router = express.Router();
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");
const { Login, Current } = require("../controllers/authController");
const { member_role } = require("../constants/common");
const {
  CreateMaintenanceTaskByType,
} = require("../controllers/technician/maintenanceController");
const {
  GetRooms,
  GetRoomByIDWithDevices,
} = require("../controllers/technician/maintenanceController");

router.get(
  "/get-rooms/v2",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.FRONT_DESK,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  GetRooms
);

router.get(
  "/get-room-devices/:room_id",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.FRONT_DESK,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  GetRoomByIDWithDevices
);

router.post("/task", CreateMaintenanceTaskByType);

module.exports = router;
