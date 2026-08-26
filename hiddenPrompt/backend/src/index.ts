import dotenv from "dotenv";

dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketEvents } from "./socket/index.js";

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);
const io = new Server(server , {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    },
});

//register all socket events
registerSocketEvents(io);

server.listen(PORT , "0.0.0.0", () => {
    console.log(`server is listening to http://localhost:${PORT}`);
    
});