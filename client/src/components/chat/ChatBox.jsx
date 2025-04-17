// import { useContext, useEffect, useRef, useState } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import { ChatContext } from "../../context/ChatContext";
// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
// import moment from "moment";
// import InputEmoji from "react-input-emoji";
// import {
//   ArrowLongLeftIcon,
//   PaperAirplaneIcon,
// } from "@heroicons/react/20/solid";
// import clsx from "clsx";
// import { toast } from "react-toastify";
// import { FaPaperclip, FaFileAlt, FaImage } from "react-icons/fa";

// const ChatBox = () => {
//   const { user } = useContext(AuthContext);
//   const {
//     currentChat,
//     updateCurrentChat,
//     messages,
//     isMessagesLoading,
//     sendTextMessage,
//     sendMediaMessage,
//   } = useContext(ChatContext);
//   const { recipientUser, error: recipientUserFetchError } =
//     useFetchRecipientUser(currentChat, user);
//   const [textMessage, setTextMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const fileInputRef = useRef(null);
//   const scroll = useRef();

//   const [typingUsers, setTypingUsers] = useState([]);

//   useEffect(() => {
//     if (!recipientUser && recipientUserFetchError?.error) {
//       toast.error(recipientUserFetchError.message);
//     }
//   }, [recipientUser, recipientUserFetchError]);

//   useEffect(() => {
//     scroll.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleTypingChange = (text) => {
//     setTextMessage(text);

//     // Call handleTyping when the user starts typing
//     if (text.trim().length > 0) {
//       handleTyping();
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     // Check file size (e.g., 5MB limit)
//     if (selectedFile.size > 5 * 1024 * 1024) {
//       toast.error("File size should be less than 5MB");
//       return;
//     }

//     setFile(selectedFile);

//     // Create preview for images
//     if (selectedFile.type.startsWith("image/")) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(selectedFile);
//     } else {
//       setPreview(null);
//     }
//   };

//   const handleSend = async () => {
//     if (!textMessage.trim() && !file) return;

//     try {
//       if (file) {
//         await sendMediaMessage(file, user, currentChat._id, () => {
//           setFile(null);
//           setPreview(null);
//         });
//       }

//       if (textMessage.trim()) {
//         await sendTextMessage(
//           textMessage,
//           user,
//           currentChat._id,
//           setTextMessage,
//         );
//       }
//     } catch (error) {
//       toast.error("Failed to send message");
//     }
//   };

//   const renderMessageContent = (message) => {
//     if (message.fileUrl) {
//       if (message.fileType?.startsWith("image/")) {
//         return (
//           <div className="max-w-full">
//             <img
//               src={message.fileUrl}
//               alt="Sent media"
//               className="max-h-64 rounded object-contain"
//             />
//           </div>
//         );
//       } else {
//         return (
//           <a
//             href={message.fileUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-2 text-blue-400 hover:underline"
//           >
//             <FaFileAlt />
//             <span>{message.fileName || "Download File"}</span>
//           </a>
//         );
//       }
//     }
//     return <span>{message.text}</span>;
//   };

//   if (!recipientUser || !currentChat)
//     return (
//       <div className="mt-5 w-full text-center sm:basis-3/4">
//         <span className="rounded-full bg-zinc-900/50 px-4 py-1.5">
//           Select a chat to start messaging
//         </span>
//       </div>
//     );

//   if (isMessagesLoading)
//     return <p className="w-full text-center sm:basis-3/4">Loading Chat...</p>;

//   return (
//     <div
//       className={clsx(
//         "flex h-[calc(100vh-5.25rem)] w-full flex-col gap-4 overflow-y-auto bg-zinc-900/50 sm:h-[80vh] sm:basis-3/4",
//         currentChat ? "" : "hidden sm:flex",
//       )}
//     >
//       <div className="flex flex-none items-center justify-between bg-zinc-700 p-1">
//         <button
//           className="flex-none sm:hidden"
//           onClick={() => {
//             updateCurrentChat(null);
//           }}
//         >
//           <ArrowLongLeftIcon className="h-5 w-5 text-white" />
//         </button>
//         <strong className="flex-1 p-2.5 text-center leading-4">
//           {recipientUser?.name}
//         </strong>
//       </div>
//       <div className="flex grow flex-col gap-3 overflow-y-auto px-3 py-0">
//         {messages &&
//           messages.map((message, index) => (
//             <div
//               key={index}
//               className={clsx(
//                 "flex max-w-[80%] grow-0 flex-col rounded-sm p-3",
//                 message?.senderId === user?._id
//                   ? "self-end bg-zinc-700"
//                   : "self-start bg-zinc-800",
//               )}
//               ref={scroll}
//             >
//               {renderMessageContent(message)}
//               <span className="mt-1 text-right text-[0.75rem] font-normal">
//                 {moment(message.createdAt).calendar()}
//               </span>
//             </div>
//           ))}
//         <div className="typing-indicator">
//           {typingUsers.length > 0 &&
//             typingUsers.includes(recipientUser?._id) && (
//               <p className="text-sm text-gray-500">Typing...</p>
//             )}
//         </div>
//       </div>
//       <div className="flex w-full items-center justify-between gap-2 bg-zinc-700 p-3">
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={() => fileInputRef.current.click()}
//             className="text-gray-300 hover:text-white"
//           >
//             <FaPaperclip className="h-5 w-5" />
//           </button>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//             className="hidden"
//             accept="image/*, video/*, audio/*, .pdf, .doc, .docx, .txt"
//           />

//           {preview && (
//             <div className="relative">
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="h-12 w-12 rounded object-cover"
//               />
//               <button
//                 onClick={() => {
//                   setFile(null);
//                   setPreview(null);
//                 }}
//                 className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {file && !preview && (
//             <div className="flex items-center gap-2 rounded bg-zinc-600 px-2 py-1">
//               <FaFileAlt className="text-gray-300" />
//               <span className="max-w-[100px] truncate text-sm">
//                 {file.name}
//               </span>
//               <button
//                 onClick={() => setFile(null)}
//                 className="rounded-full bg-red-500 p-1 text-white"
//               >
//                 ×
//               </button>
//             </div>
//           )}
//         </div>

//         <InputEmoji
//           value={textMessage}
//           // onChange={setTextMessage}
//           onChange={handleTypingChange}
//           fontFamily="nunito"
//           borderRadius={2}
//           onEnter={handleSend}
//         />

//         <button
//           className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50"
//           onClick={handleSend}
//           disabled={!textMessage.trim() && !file}
//         >
//           <PaperAirplaneIcon className="h-4 w-4 -rotate-45 text-white" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;

// import { useContext, useEffect, useRef, useState } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import { ChatContext } from "../../context/ChatContext";
// import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
// import moment from "moment";
// import InputEmoji from "react-input-emoji";
// import {
//   ArrowLongLeftIcon,
//   PaperAirplaneIcon,
// } from "@heroicons/react/20/solid";
// import clsx from "clsx";
// import { toast } from "react-toastify";
// import { FaPaperclip, FaFileAlt } from "react-icons/fa";

// const ChatBox = () => {
//   const { user } = useContext(AuthContext);
//   const {
//     currentChat,
//     updateCurrentChat,
//     messages,
//     isMessagesLoading,
//     sendTextMessage,
//     sendMediaMessage,
//     socket,
//   } = useContext(ChatContext);

//   const { recipientUser, error: recipientUserFetchError } =
//     useFetchRecipientUser(currentChat, user);

//   const [textMessage, setTextMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [typingUsers, setTypingUsers] = useState([]);

//   const fileInputRef = useRef(null);
//   const scroll = useRef();
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     if (!recipientUser && recipientUserFetchError?.error) {
//       toast.error(recipientUserFetchError.message);
//     }
//   }, [recipientUser, recipientUserFetchError]);

//   useEffect(() => {
//     scroll.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Typing indicator setup
//   useEffect(() => {
//     if (!socket || !currentChat || !user) return;

//     const handleTyping = ({ senderId }) => {
//       if (senderId !== user._id && currentChat.members.includes(senderId)) {
//         setTypingUsers((prev) => [...new Set([...prev, senderId])]);

//         // Remove after 3 seconds
//         setTimeout(() => {
//           setTypingUsers((prev) => prev.filter((id) => id !== senderId));
//         }, 3000);
//       }
//     };

//     socket.on("typing", handleTyping);

//     return () => {
//       socket.off("typing", handleTyping);
//     };
//   }, [socket, currentChat, user]);

//   const handleTypingChange = (text) => {
//     setTextMessage(text);

//     if (socket && currentChat) {
//       socket.emit("typing", {
//         senderId: user._id,
//         recipientId: recipientUser._id,
//         chatId: currentChat._id,
//       });
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     if (selectedFile.size > 5 * 1024 * 1024) {
//       toast.error("File size should be less than 5MB");
//       return;
//     }

//     setFile(selectedFile);

//     if (selectedFile.type.startsWith("image/")) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(selectedFile);
//     } else {
//       setPreview(null);
//     }
//   };

//   const handleSend = async () => {
//     if (!textMessage.trim() && !file) return;

//     try {
//       if (file) {
//         await sendMediaMessage(file, user, currentChat._id, () => {
//           setFile(null);
//           setPreview(null);
//         });
//       }

//       if (textMessage.trim()) {
//         await sendTextMessage(
//           textMessage,
//           user,
//           currentChat._id,
//           setTextMessage,
//         );
//       }
//     } catch (error) {
//       toast.error("Failed to send message");
//     }
//   };

//   const renderMessageContent = (message) => {
//     if (message.fileUrl) {
//       if (message.fileType?.startsWith("image/")) {
//         return (
//           <div className="max-w-full">
//             <img
//               src={message.fileUrl}
//               alt="Sent media"
//               className="max-h-64 rounded object-contain"
//             />
//           </div>
//         );
//       } else {
//         return (
//           <a
//             href={message.fileUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-2 text-blue-400 hover:underline"
//           >
//             <FaFileAlt />
//             <span>{message.fileName || "Download File"}</span>
//           </a>
//         );
//       }
//     }
//     return <span>{message.text}</span>;
//   };

//   if (!recipientUser || !currentChat)
//     return (
//       <div className="mt-5 w-full text-center sm:basis-3/4">
//         <span className="rounded-full bg-zinc-900/50 px-4 py-1.5">
//           Select a chat to start messaging
//         </span>
//       </div>
//     );

//   if (isMessagesLoading)
//     return <p className="w-full text-center sm:basis-3/4">Loading Chat...</p>;

//   return (
//     <div
//       className={clsx(
//         "flex h-[calc(100vh-5.25rem)] w-full flex-col gap-4 overflow-y-auto bg-zinc-900/50 sm:h-[80vh] sm:basis-3/4",
//         currentChat ? "" : "hidden sm:flex",
//       )}
//     >
//       <div className="flex flex-none items-center justify-between bg-zinc-700 p-1">
//         <button
//           className="flex-none sm:hidden"
//           onClick={() => updateCurrentChat(null)}
//         >
//           <ArrowLongLeftIcon className="h-5 w-5 text-white" />
//         </button>
//         <strong className="flex-1 p-2.5 text-center leading-4">
//           {recipientUser?.name}
//         </strong>
//       </div>

//       <div className="flex grow flex-col gap-3 overflow-y-auto px-3 py-0">
//         {messages &&
//           messages.map((message, index) => (
//             <div
//               key={index}
//               className={clsx(
//                 "flex max-w-[80%] grow-0 flex-col rounded-sm p-3",
//                 message?.senderId === user?._id
//                   ? "self-end bg-zinc-700"
//                   : "self-start bg-zinc-800",
//               )}
//               ref={scroll}
//             >
//               {renderMessageContent(message)}
//               <span className="mt-1 text-right text-[0.75rem] font-normal">
//                 {moment(message.createdAt).calendar()}
//               </span>
//             </div>
//           ))}

//         {/* Typing indicator */}
//         {typingUsers.includes(recipientUser._id) && (
//           <p className="text-sm text-gray-500">Typing...</p>
//         )}
//       </div>

//       <div className="flex w-full items-center justify-between gap-2 bg-zinc-700 p-3">
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={() => fileInputRef.current.click()}
//             className="text-gray-300 hover:text-white"
//           >
//             <FaPaperclip className="h-5 w-5" />
//           </button>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//             className="hidden"
//             accept="image/*, video/*, audio/*, .pdf, .doc, .docx, .txt"
//           />

//           {preview && (
//             <div className="relative">
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="h-12 w-12 rounded object-cover"
//               />
//               <button
//                 onClick={() => {
//                   setFile(null);
//                   setPreview(null);
//                 }}
//                 className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {file && !preview && (
//             <div className="flex items-center gap-2 rounded bg-zinc-600 px-2 py-1">
//               <FaFileAlt className="text-gray-300" />
//               <span className="max-w-[100px] truncate text-sm">
//                 {file.name}
//               </span>
//               <button
//                 onClick={() => setFile(null)}
//                 className="rounded-full bg-red-500 p-1 text-white"
//               >
//                 ×
//               </button>
//             </div>
//           )}
//         </div>

//         <InputEmoji
//           value={textMessage}
//           onChange={handleTypingChange}
//           fontFamily="nunito"
//           borderRadius={2}
//           onEnter={handleSend}
//         />

//         <button
//           className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50"
//           onClick={handleSend}
//           disabled={!textMessage.trim() && !file}
//         >
//           <PaperAirplaneIcon className="h-4 w-4 -rotate-45 text-white" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;

import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import {
  ArrowLongLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { toast } from "react-toastify";
import { FaPaperclip, FaFileAlt } from "react-icons/fa";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const {
    currentChat,
    updateCurrentChat,
    messages,
    isMessagesLoading,
    sendTextMessage,
    sendMediaMessage,
    socket,
  } = useContext(ChatContext);

  const { recipientUser, error: recipientUserFetchError } =
    useFetchRecipientUser(currentChat, user);

  const [textMessage, setTextMessage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  const fileInputRef = useRef(null);
  const scroll = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!recipientUser && recipientUserFetchError?.error) {
      toast.error(recipientUserFetchError.message);
    }
  }, [recipientUser, recipientUserFetchError]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator setup (receiving end)
  useEffect(() => {
    if (!socket || !currentChat || !user || !recipientUser) return;

    const handleTyping = ({ senderId }) => {
      if (senderId !== user._id && currentChat.members.includes(senderId)) {
        setTypingUsers((prev) => [...new Set([...prev, senderId])]);

        // Remove after 3 seconds (fallback)
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== senderId));
        }, 3000);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, currentChat, user, recipientUser]);

  const handleTypingChange = (text) => {
    setTextMessage(text);

    if (socket && currentChat && recipientUser) {
      // Emit 'typing' event immediately when text changes
      socket.emit("typing", {
        senderId: user._id,
        recipientId: recipientUser._id,
        chatId: currentChat._id,
      });
    }

    // Reset timeout if the user is still typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator after 3 seconds of inactivity
      if (socket && currentChat && recipientUser) {
        socket.emit("stopTyping", {
          senderId: user._id,
          recipientId: recipientUser._id,
          chatId: currentChat._id,
        });
      }
    }, 3000);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSend = async () => {
    if (!textMessage.trim() && !file && !replyingTo) return;

    const messagePayload = {
      chatId: currentChat._id,
      senderId: user._id,
      ...(textMessage.trim() && { text: textMessage.trim() }),
      ...(replyingTo && { replyTo: replyingTo._id }), // Include the ID of the replied-to message
    };

    try {
      if (file) {
        await sendMediaMessage(
          file,
          user,
          currentChat._id,
          () => {
            setFile(null);
            setPreview(null);
            setReplyingTo(null); // Clear reply after sending
          },
          replyingTo?._id,
        ); // Pass replyTo ID to sendMediaMessage
      }

      if (textMessage.trim()) {
        await sendTextMessage(
          textMessage,
          user,
          currentChat._id,
          setTextMessage,
          replyingTo?._id, // Pass replyTo ID to sendTextMessage
        );
        setReplyingTo(null); // Clear reply after sending
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const renderMessageContent = (message) => {
    if (message.fileUrl) {
      if (message.fileType?.startsWith("image/")) {
        return (
          <div className="max-w-full">
            <img
              src={message.fileUrl}
              alt="Sent media"
              className="max-h-64 rounded object-contain"
            />
          </div>
        );
      } else {
        return (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:underline"
          >
            <FaFileAlt />
            <span>{message.fileName || "Download File"}</span>
          </a>
        );
      }
    }
    return <span>{message.text}</span>;
  };

  if (!recipientUser || !currentChat)
    return (
      <div className="mt-5 w-full text-center sm:basis-3/4">
        <span className="rounded-full bg-zinc-900/50 px-4 py-1.5">
          Select a chat to start messaging
        </span>
      </div>
    );

  if (isMessagesLoading)
    return <p className="w-full text-center sm:basis-3/4">Loading Chat...</p>;

  return (
    <div
      className={clsx(
        "flex h-[calc(100vh-5.25rem)] w-full flex-col gap-4 overflow-y-auto bg-zinc-900/50 sm:h-[80vh] sm:basis-3/4",
        currentChat ? "" : "hidden sm:flex",
      )}
    >
      <div className="flex flex-none items-center justify-between bg-zinc-700 p-1">
        <button
          className="flex-none sm:hidden"
          onClick={() => updateCurrentChat(null)}
        >
          <ArrowLongLeftIcon className="h-5 w-5 text-white" />
        </button>
        <strong className="flex-1 p-2.5 text-center leading-4">
          {recipientUser?.name}
        </strong>
      </div>

      <div className="flex grow flex-col gap-3 overflow-y-auto px-3 py-0">
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={clsx(
                "flex max-w-[80%] grow-0 flex-col rounded-sm p-3",
                message?.senderId === user?._id
                  ? "self-end bg-zinc-700"
                  : "self-start bg-zinc-800",
              )}
              ref={scroll}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => handleReply(message)}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Reply
                </button>
              </div>
              {message.replyTo && (
                <div className="mb-1 rounded bg-zinc-700 p-1 text-xs italic text-gray-400">
                  Replying to:{" "}
                  {messages.find((m) => m._id === message.replyTo)?.text ||
                    messages.find((m) => m._id === message.replyTo)?.fileName ||
                    "Previous Message"}
                </div>
              )}
              {renderMessageContent(message)}
              <span className="mt-1 text-right text-[0.75rem] font-normal">
                {moment(message.createdAt).calendar()}
              </span>
            </div>
          ))}

        {/* Typing indicator */}
        {typingUsers.includes(recipientUser?._id) && (
          <p className="text-sm text-gray-500">Typing...</p>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-2 bg-zinc-700 p-3">
        {replyingTo && (
          <div className="mb-2 rounded bg-zinc-800 p-2 text-sm">
            Replying to:{" "}
            <span className="italic">
              {replyingTo.text || replyingTo.fileName || "Media"}
            </span>
            <button
              onClick={handleCancelReply}
              className="ml-2 text-gray-500 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="text-gray-300 hover:text-white"
          >
            <FaPaperclip className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, video/*, audio/*, .pdf, .doc, .docx, .txt"
          />

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="h-12 w-12 rounded object-cover"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                ×
              </button>
            </div>
          )}

          {file && !preview && (
            <div className="flex items-center gap-2 rounded bg-zinc-600 px-2 py-1">
              <FaFileAlt className="text-gray-300" />
              <span className="max-w-[100px] truncate text-sm">
                {file.name}
              </span>
              <button
                onClick={() => setFile(null)}
                className="rounded-full bg-red-500 p-1 text-white"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <InputEmoji
          value={textMessage}
          onChange={handleTypingChange}
          fontFamily="nunito"
          borderRadius={2}
          onEnter={handleSend}
        />

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50"
          onClick={handleSend}
          disabled={!textMessage.trim() && !file && !replyingTo}
        >
          <PaperAirplaneIcon className="h-4 w-4 -rotate-45 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
