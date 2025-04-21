import { io } from "socket.io-client";

const URL =
    import.meta.env.MODE === "production"
        ? "https://real-chat-qqz0.onrender.com
        : "http://localhost:3000";

export const socket = io(URL);
