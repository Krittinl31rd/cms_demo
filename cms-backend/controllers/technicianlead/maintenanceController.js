const sequelize = require("../../config/db");
const upload = require("../../middleware/uploadImage");
const {
  cleaning_status,
  guest_presence_status,
  device_type,
} = require("../../constants/common");

// app.post('/upload-multiple', upload.array('images', 10), (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ error: 'No files uploaded or invalid file type' });
//   }

//   const uploadedFiles = req.files.map(file => ({
//     filename: file.filename,
//     path: `/uploads/${file.filename}`
//   }));

//   res.json({
//     message: 'Upload success!',
//     files: uploadedFiles
//   });
// });

exports.CreateMaintennanceTask = async (req, res) => {
  try {
    const {
      room_id,
      assigned_to,
      problem_description,
      fix_description,
      status_id,
      started_at,
      ended_at,
      created_by,
      image_report,
    } = req.body;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
