// import Message from "../models/messageModel.js";

// const createMessage = async (req, res) => {
//   const { chatId, senderId, text } = req.body;

//   const message = new Message({
//     chatId,
//     senderId,
//     text,
//   });

//   try {
//     const response = await message.save();
//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// };

// const getMessages = async (req, res) => {
//   const { chatId } = req.params;

//   try {
//     const messages = await Message.find({ chatId });
//     res.status(200).json(messages);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// };

// export { createMessage, getMessages };




import Message from "../models/messageModel.js";
import path from "path";

const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  let messageData = {
    chatId,
    senderId,
    text,
  };

  if (req.file) {
    const filePath = `/uploads/${req.file.filename}`;
    messageData.fileUrl = filePath;
    messageData.fileName = req.file.originalname;
    messageData.fileType = req.file.mimetype;
  }

  try {
    const message = new Message(messageData);
    const savedMessage = await message.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    console.error("Message creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createMessage, getMessages };
