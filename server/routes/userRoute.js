import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  findUser,
  getUsers,
  updateProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/find/:userId", protect, findUser);
router.get("/", protect, getUsers);
router.put("/profile", protect, updateProfile);
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully", file: req.file });
});

export default router;
