const { member_role } = require("../constants/common");
const express = require("express");
const router = express.Router();
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");
const {
  Login,
  Current,
  CreateInvite,
  RevokeInvite,
  Approve,
  Reject,
  RegisterWithToken,
  ValiDateToken,
  CreateUser,
} = require("../controllers/authController");

router.post("/api/login", Login);
router.post(
  "/api/create-user",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateUser
);

// Get current user (any logged in user)
router.get("/api/me", AuthCheck, Current);

// Superadmin generates invite link
router.post(
  "/api/invites",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateInvite
);
// Superadmin revoke invite link
router.get(
  "/api/revoke/:token",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  RevokeInvite
);

// Superadmin approves/rejects Users
router.get(
  "/api/approves/:id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  Approve
);
router.get(
  "/api/reject/:id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  Reject
);

// Apply via token link
router.post("/api/register/:token", RegisterWithToken);
// validate token
router.get("/api/register/:token/validate", ValiDateToken);

module.exports = router;
