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
  CreateDevice,
} = require("../controllers/superadmin/roomController");
const {
  GetUsers,
  GetInvitationTokens,
  GetPendingUsers,
} = require("../controllers/superadmin/userController");

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
  RoleCheck([member_role.SUPER_ADMIN]),
  GetRooms
);
router.get(
  "/api/get-room/:room_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetRoomByID
);

// Devices
router.post(
  "/api/create-device",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateDevice
);

module.exports = router;
