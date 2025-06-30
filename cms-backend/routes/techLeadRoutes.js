const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadImage");
const { AuthCheck } = require("../middleware/authMiddleware");
const { RoleCheck } = require("../middleware/roleMiddleware");
const { PermissionCheck } = require("../middleware/permissionMiddleware");
const { Login, Current } = require("../controllers/authController");
const { member_role } = require("../constants/common");
const {
  CreateMaintenanceTask,
  UpdateMaintenanceTask,
  GetMaintenanceTask,
  GetMaintenanceTaskByUserID,
  GetMaintenanceTaskByID,
  GetTechnicians,
} = require("../controllers/technicianlead/maintenanceController");

router.get(
  "/api/get-technicians",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetTechnicians
);

router.post(
  "/api/create-maintenancetask",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  CreateMaintenanceTask
);
router.get(
  "/api/get-maintenancetask",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetMaintenanceTask
);
router.get(
  "/api/get-maintenancetask/:id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetMaintenanceTaskByID
);
router.get(
  "/api/get-maintenancetask/user/:user_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetMaintenanceTaskByUserID
);
router.put(
  "/api/update-maintenancetask/:task_id",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  upload.fields([
    { name: "before", maxCount: 5 },
    { name: "after", maxCount: 5 },
    { name: "other", maxCount: 5 },
  ]),
  UpdateMaintenanceTask
);

router.put(
  "/upload-multiple",
  upload.fields([
    { name: "before", maxCount: 5 },
    { name: "after", maxCount: 5 },
    { name: "other", maxCount: 5 },
  ]),
  (req, res) => {
    const files = req.files;
    if (!files) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const result = [];
    Object.keys(files).forEach((key) => {
      files[key].forEach((file) => {
        result.push({
          field: key,
          filename: file.filename,
          path: `${process.env.PATH_UPLOAD}/${key}/${file.filename}`,
          // path: file.path.replace(/\\/g, "/"),
        });
      });
    });

    res.status(200).json({
      message: "Upload successful",
      files: result,
    });
  }
);

module.exports = router;
