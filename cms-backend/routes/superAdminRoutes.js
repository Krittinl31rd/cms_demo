const { member_role } = require("../constants/common");
const express = require("express");
const router = express.Router();
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");

const {
  CreateRoom,
  GetRooms,
  GetRoomByID,
  UpdateRoom,
  DeleteRoom,
  GetRoomWithConfig,
} = require("../controllers/superadmin/roomController");
const {
  GetUsers,
  GetInvitationTokens,
  GetPendingUsers,
} = require("../controllers/superadmin/userController");
const {
  CreateDevice,
  UpdateDevice,
  DeleteDevice,
  GetRoomDevicesLog,
} = require("../controllers/superadmin/deviceController");

// Users
router.get(
  "/api/get-users",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetUsers
);
router.get(
  "/api/get-invite-tokens",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetInvitationTokens
);
router.get(
  "/api/get-pending-users",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetPendingUsers
);

// Rooms
router.post(
  "/api/create-room",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateRoom
);
router.get(
  "/api/get-rooms",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.FRONT_DESK,
    member_role.TECHNICIAN_LEAD,
  ]),
  GetRooms
);
router.get(
  "/api/get-room/:room_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetRoomByID
);
router.get(
  "/api/get-room-config",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetRoomWithConfig
);
router.put(
  "/api/update-room/:room_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  UpdateRoom
);
router.delete(
  "/api/delete-room/:room_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  DeleteRoom
);

// Devices
router.post(
  "/api/create-device",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateDevice
);
router.put(
  "/api/update-device/:room_id/:device_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  UpdateDevice
);
router.delete(
  "/api/delete-device/:room_id/:device_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  DeleteDevice
);

router.get(
  "/api/get-room-logs",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetRoomDevicesLog
);

module.exports = router;
