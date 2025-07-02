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
  "/get-technicians",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  GetTechnicians
);

router.post(
  "/create-maintenancetask",
  AuthCheck,
  RoleCheck([member_role.SUPER_ADMIN, member_role.TECHNICIAN_LEAD]),
  CreateMaintenanceTask
);
router.get(
  "/get-maintenancetask",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  GetMaintenanceTask
);
router.get(
  "/get-maintenancetask/:id",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  GetMaintenanceTaskByID
);
router.get(
  "/get-maintenancetask/user/:user_id",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.TECHNICIAN_LEAD,
    member_role.TECHNICIAN,
  ]),
  GetMaintenanceTaskByUserID
);
router.put(
  "/update-maintenancetask/:task_id",
  AuthCheck,
  RoleCheck([
    member_role.SUPER_ADMIN,
    member_role.TECHNICIAN_LEAD,
    ,
    member_role.TECHNICIAN,
  ]),
  upload.fields([
    { name: "before", maxCount: 5 },
    { name: "after", maxCount: 5 },
    { name: "other", maxCount: 5 },
  ]),
  UpdateMaintenanceTask
);

router.put("/upload-profile-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.file;
  const response = {
    filename: file.filename,
  };
  response.path = `${process.env.PATH_UPLOAD_PROFILE}/${file.filename}`;
  // response.path = file.path.replace(/\\/g, "/");
  res.status(200).json({
    message: "Upload successful",
    file: response,
  });
});

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
