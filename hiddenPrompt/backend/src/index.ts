import http from "http";
import { Server } from "socket.io";
import app from "./app.ts";
import { registerSocketEvents } from "./socket/index.ts";


const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server , {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    },
});

//register all socket events
registerSocketEvents(io);

server.listen(PORT , () => {
    console.log(`server is listening to http://localhost:${PORT}`);
    
})