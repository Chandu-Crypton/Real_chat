// import express from "express";
// import {
//   createMessage,
//   getMessages,
// } from "../controllers/messageController.js";

// const router = express.Router();

// router.post("/", createMessage);
// router.get("/:chatId", getMessages);

// export default router;


import express from "express";
import multer from "multer";
import { createMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), createMessage);
router.get("/:chatId", getMessages);

export default router;
