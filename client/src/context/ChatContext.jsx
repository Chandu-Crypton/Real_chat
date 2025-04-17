// import { createContext, useCallback, useEffect, useState } from "react";
// import { baseUrl, getRequest, postRequest } from "../utils/services";
// import { io } from "socket.io-client";

// export const ChatContext = createContext();

// export const ChatContextProvider = ({ children, user }) => {
//   const [userChats, setUserChats] = useState(null);
//   const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
//   const [userChatsError, setUserChatsError] = useState(null);
//   const [potentialChats, setPotentialChats] = useState([]);
//   const [currentChat, setCurrentChat] = useState(null);
//   const [messages, setMessages] = useState(null);
//   const [isMessagesLoading, setIsMessagesLoading] = useState(false);
//   const [messagesError, setMessagesError] = useState(null);
//   const [sendTextMessageError, setSendTextMessageError] = useState(null);
//   const [sendMediaMessageError, setSendMediaMessageError] = useState(null);
//   const [newMessage, setNewMessage] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);

//   const [typingUsers, setTypingUsers] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const handleTyping = useCallback(() => {
//     if (!currentChat) return;

//     const recipientId = currentChat?.members.find((id) => id !== user?._id);
//     socket.emit("typing", {
//       chatId: currentChat._id,
//       userId: user._id,
//       recipientId,
//     });
//   }, [currentChat, socket, user]);

//   // Listen for typing events from other users
//   useEffect(() => {
//     if (!socket || !currentChat) return;

//     socket.on("userTyping", (data) => {
//       setTypingUsers((prev) => {
//         // Add or remove the typing user based on the event
//         if (data.chatId === currentChat._id) {
//           if (!prev.includes(data.userId)) {
//             return [...prev, data.userId];
//           }
//         }
//         return prev;
//       });
//     });

//     return () => {
//       socket.off("userTyping");
//     };
//   }, [socket, currentChat]);

//   // initial socket
//   useEffect(() => {
//     const newSocket = io(
//       import.meta.env.MODE === "production"
//         ? "https://mern-chat-socket.onrender.com"
//         : "http://localhost:3000",
//     );
//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [user]);

//   // add online users
//   useEffect(() => {
//     if (socket === null) return;
//     socket.emit("addNewUser", user?._id);
//     socket.on("getOnlineUsers", (res) => {
//       setOnlineUsers(res);
//     });

//     return () => {
//       socket.off("getOnlineUsers");
//     };
//   }, [socket]);

//   // send message
//   useEffect(() => {
//     if (socket === null) return;

//     const recipientId = currentChat?.members.find((id) => id !== user?._id);

//     socket.emit("sendMessage", { ...newMessage, recipientId });
//   }, [newMessage]);

//   // receive message and notification
//   useEffect(() => {
//     if (socket === null) return;

//     socket.on("getMessage", (res) => {
//       if (currentChat?._id !== res.chatId) return;

//       setMessages((prev) => [...prev, res]);
//     });

//     socket.on("getNotification", (res) => {
//       const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

//       if (isChatOpen) {
//         setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
//       } else {
//         setNotifications((prev) => [res, ...prev]);
//       }
//     });

//     return () => {
//       socket.off("getMessage");
//       socket.off("getNotification");
//     };
//   }, [socket, currentChat]);

//   useEffect(() => {
//     const getUsers = async () => {
//       const response = await getRequest(`${baseUrl}/users`);

//       if (response.error) {
//         return console.log("Error fetching users", response);
//       }

//       const pChats = response.filter((u) => {
//         let isChatCreated = false;

//         if (user?._id === u._id) return false;

//         if (userChats) {
//           isChatCreated = userChats?.some((chat) => {
//             return chat.members[0] === u._id || chat.members[1] === u._id;
//           });
//         }

//         return !isChatCreated;
//       });

//       setPotentialChats(pChats);
//       setAllUsers(response);
//     };

//     getUsers();
//   }, [userChats]);

//   useEffect(() => {
//     const getUserChats = async () => {
//       if (user?._id) {
//         setIsUserChatsLoading(true);
//         setUserChatsError(null);

//         const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

//         setIsUserChatsLoading(false);

//         if (response.error) {
//           return setUserChatsError(response);
//         }

//         setUserChats(response);
//       }
//     };

//     getUserChats();
//   }, [user, notifications]);

//   useEffect(() => {
//     const getMessages = async () => {
//       setIsMessagesLoading(true);
//       setMessagesError(null);

//       const response = await getRequest(
//         `${baseUrl}/messages/${currentChat?._id}`,
//       );

//       setIsMessagesLoading(false);

//       if (response.error) {
//         return setMessagesError(response);
//       }

//       setMessages(response);
//     };

//     getMessages();
//   }, [currentChat]);

//   const sendTextMessage = useCallback(
//     async (textMessage, sender, currentChatId, setTextMessage) => {
//       if (!textMessage) return console.log("You must type something...");

//       const response = await postRequest(
//         `${baseUrl}/messages`,
//         JSON.stringify({
//           chatId: currentChatId,
//           senderId: sender._id,
//           text: textMessage,
//         }),
//       );

//       if (response.error) {
//         return setSendTextMessageError(response);
//       }

//       setNewMessage(response);
//       setMessages((prev) => [...prev, response]);
//       setTextMessage("");
//     },
//     [],
//   );

//   const sendMediaMessage = useCallback(
//     async (file, sender, currentChatId, onSuccess) => {
//       if (!file) return;

//       try {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("chatId", currentChatId);
//         formData.append("senderId", sender._id);

//         const response = await fetch(`${baseUrl}/messages`, {
//           method: "POST",
//           body: formData,
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             // No need for 'Content-Type': multipart/form-data — browser sets this automatically
//           },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to upload file");
//         }

//         setNewMessage(data);
//         setMessages((prev) => [...prev, data]);
//         onSuccess?.();
//       } catch (error) {
//         console.error("Error sending media:", error);
//         setSendMediaMessageError(error.message);
//       }
//     },
//     [],
//   );

//   const updateCurrentChat = useCallback((chat) => {
//     setCurrentChat(chat);
//   }, []);

//   const createChat = useCallback(async (firstId, secondId) => {
//     const response = await postRequest(
//       `${baseUrl}/chats`,
//       JSON.stringify({ firstId, secondId }),
//     );

//     if (response.error) {
//       return console.log("Error creating chat", response);
//     }

//     setUserChats((prev) => [...prev, response]);
//   }, []);

//   const markAllNotificationsAsRead = useCallback((notifications) => {
//     const mNotifications = notifications.map((n) => {
//       return { ...n, isRead: true };
//     });

//     setNotifications(mNotifications);
//   }, []);

//   const markNotificationAsRead = useCallback(
//     (n, userChats, user, notifications) => {
//       const desiredChat = userChats.find((chat) => {
//         const chatMembers = [user._id, n.senderId];
//         const isDesiredChat = chat?.members.every((member) => {
//           return chatMembers.includes(member);
//         });
//         return isDesiredChat;
//       });

//       const mNotifications = notifications.map((el) => {
//         if (n.senderId === el.senderId) {
//           return { ...n, isRead: true };
//         } else {
//           return el;
//         }
//       });

//       updateCurrentChat(desiredChat);
//       setNotifications(mNotifications);
//     },
//     [],
//   );

//   const markThisUserNotificationsAsRead = useCallback(
//     (thisUserNotifications, notifications) => {
//       const mNotifications = notifications.map((el) => {
//         let notification;
//         thisUserNotifications.forEach((n) => {
//           if (n.senderId === el.senderId) {
//             notification = { ...n, isRead: true };
//           } else {
//             notification = el;
//           }
//         });
//         return notification;
//       });
//       setNotifications(mNotifications);
//     },
//     [],
//   );

//   return (
//     <ChatContext.Provider
//       value={{
//         userChats,
//         isUserChatsLoading,
//         userChatsError,
//         potentialChats,
//         createChat,
//         updateCurrentChat,
//         messages,
//         isMessagesLoading,
//         messagesError,
//         currentChat,
//         sendTextMessage,
//         sendMediaMessage,
//         onlineUsers,
//         notifications,
//         allUsers,
//         markAllNotificationsAsRead,
//         markNotificationAsRead,
//         markThisUserNotificationsAsRead,
//         isTyping,
//         setIsTyping,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };
import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [sendMediaMessageError, setSendMediaMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeoutId, setTypingTimeoutId] = useState(null);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(
      import.meta.env.MODE === "production"
        ? "https://mern-chat-socket.onrender.com"
        : "http://localhost:3000",
    );
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Add online users
  useEffect(() => {
    if (!socket) return;
    socket.emit("addNewUser", user?._id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  // Handle typing (emit)
  const handleTyping = useCallback(() => {
    if (!currentChat || !socket) return;
    const recipientId = currentChat.members.find((id) => id !== user._id);
    socket.emit("typing", {
      chatId: currentChat._id,
      userId: user._id,
      recipientId,
    });
  }, [socket, currentChat, user]);

  // Handle stop typing (emit)
  const handleStopTyping = useCallback(() => {
    if (!currentChat || !socket) return;
    const recipientId = currentChat.members.find((id) => id !== user._id);
    socket.emit("stopTyping", {
      chatId: currentChat._id,
      userId: user._id,
      recipientId,
    });
  }, [socket, currentChat, user]);

  // Listen for typing from other users
  useEffect(() => {
    if (!socket || !currentChat || !user) return;

    const handleUserTyping = ({ chatId, userId }) => {
      if (chatId === currentChat._id && userId !== user._id) {
        setIsRecipientTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ chatId, userId }) => {
      if (chatId === currentChat._id && userId !== user._id) {
        setIsRecipientTyping(false);
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [socket, currentChat, user]);

  // Send message
  useEffect(() => {
    if (!socket || !newMessage) return;
    const recipientId = currentChat?.members.find((id) => id !== user?._id);
    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);

  // Receive message & notification
  useEffect(() => {
    if (!socket) return;

    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) return;
      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      const isChatOpen = currentChat?.members.some((id) => id === res.senderId);
      setNotifications((prev) =>
        isChatOpen ? [{ ...res, isRead: true }, ...prev] : [res, ...prev],
      );
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);
      if (response.error) return console.log("Error fetching users", response);

      const pChats = response.filter((u) => {
        if (user?._id === u._id) return false;

        const isChatCreated = userChats?.some((chat) =>
          chat.members.includes(u._id),
        );

        return !isChatCreated;
      });

      setPotentialChats(pChats);
      setAllUsers(response);
    };

    getUsers();
  }, [userChats]);

  useEffect(() => {
    const getUserChats = async () => {
      if (!user?._id) return;
      setIsUserChatsLoading(true);
      setUserChatsError(null);

      const response = await getRequest(`${baseUrl}/chats/${user._id}`);
      setIsUserChatsLoading(false);
      if (response.error) return setUserChatsError(response);

      setUserChats(response);
    };

    getUserChats();
  }, [user, notifications]);

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
      setIsMessagesLoading(true);
      setMessagesError(null);

      const response = await getRequest(
        `${baseUrl}/messages/${currentChat._id}`,
      );
      setIsMessagesLoading(false);
      if (response.error) return setMessagesError(response);

      setMessages(response);
    };

    getMessages();
  }, [currentChat]);

  const sendTextMessage = useCallback(
    async (
      textMessage,
      sender,
      currentChatId,
      setTextMessage,
      replyTo = null,
    ) => {
      if (!textMessage) return console.log("You must type something...");
      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
          ...(replyTo && { replyTo }),
        }),
      );

      if (response.error) return setSendTextMessageError(response);

      setNewMessage(response);
      setMessages((prev) => [...prev, response]);
      setTextMessage("");
    },
    [],
  );

  const sendMediaMessage = useCallback(
    async (file, sender, currentChatId, onSuccess, replyTo = null) => {
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("chatId", currentChatId);
        formData.append("senderId", sender._id);
        if (replyTo) {
          formData.append("replyTo", replyTo);
        }

        const response = await fetch(`${baseUrl}/messages`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Upload failed");

        setNewMessage(data);
        setMessages((prev) => [...prev, data]);
        onSuccess?.();
      } catch (err) {
        console.error("Media message error:", err);
        setSendMediaMessageError(err.message);
      }
    },
    [],
  );

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({ firstId, secondId }),
    );
    if (response.error) return console.log("Error creating chat", response);
    setUserChats((prev) => [...prev, response]);
  }, []);

  const markAllNotificationsAsRead = useCallback((notifications) => {
    const mNotifications = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(mNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (n, userChats, user, notifications) => {
      const desiredChat = userChats.find(
        (chat) =>
          chat.members.includes(user._id) && chat.members.includes(n.senderId),
      );

      const mNotifications = notifications.map((el) =>
        n.senderId === el.senderId ? { ...n, isRead: true } : el,
      );

      updateCurrentChat(desiredChat);
      setNotifications(mNotifications);
    },
    [],
  );

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotifications, notifications) => {
      const mNotifications = notifications.map((el) => {
        const matchingNote = thisUserNotifications.find(
          (n) => n.senderId === el.senderId,
        );
        return matchingNote ? { ...matchingNote, isRead: true } : el;
      });

      setNotifications(mNotifications);
    },
    [],
  );

  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
        sendTextMessage,
        sendMediaMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead,
        isTyping,
        handleTyping,
        handleStopTyping,
        isRecipientTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
