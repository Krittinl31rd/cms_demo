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
  GetRoomByIDWithDevices,
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
  "/get-users",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetUsers
);
router.get(
  "/get-invite-tokens",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetInvitationTokens
);
router.get(
  "/get-pending-users",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  GetPendingUsers
);

// Rooms
router.post(
  "/create-room",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateRoom
);

router.get(
  "/get-rooms",
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
  "/get-room/:room_id",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.FRONT_DESK,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  GetRoomByID
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

router.get(
  "/get-room-config",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetRoomWithConfig
);

router.put(
  "/update-room/:room_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  UpdateRoom
);

router.delete(
  "/delete-room/:room_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  DeleteRoom
);

// Devices
router.post(
  "/create-device",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateDevice
);

router.put(
  "/update-device/:room_id/:device_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  UpdateDevice
);

router.delete(
  "/delete-device/:room_id/:device_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  DeleteDevice
);

router.get(
  "/get-room-logs",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetRoomDevicesLog
);

module.exports = router;
