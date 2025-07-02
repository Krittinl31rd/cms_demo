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
  IsActiveUser,
  DeleteUser,
  Logout,
} = require("../controllers/authController");

router.post("/login", Login);
router.post("/logout", Logout);

router.post(
  "/create-user",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateUser
);
router.put(
  "/isactive-user/:user_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  IsActiveUser
);
router.delete(
  "/delete-user/:user_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  DeleteUser
);

// Get current user (any logged in user)
router.get("/me", AuthCheck, Current);

// Superadmin generates invite link
router.post(
  "/invites",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  CreateInvite
);
// Superadmin revoke invite link
router.get(
  "/revoke/:token",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  RevokeInvite
);

// Superadmin approves/rejects Users
router.get(
  "/approves/:id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  Approve
);
router.get(
  "/reject/:id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN]),
  Reject
);

// Apply via token link
router.post("/register/:token", RegisterWithToken);
// validate token
router.get("/register/:token/validate", ValiDateToken);

module.exports = router;
