import { io } from "socket.io-client";

const URL =
    import.meta.env.MODE === "production"
        ? "https://mern-chat-socket.onrender.com"
        : "http://localhost:3000";

export const socket = io(URL);
