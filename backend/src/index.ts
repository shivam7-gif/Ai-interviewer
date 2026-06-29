import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { intializeSocket } from "./socket.js";
import playlistRoutes from "./routes/playlist.routes";
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/playlists", playlistRoutes);
const server = http.createServer(app);
intializeSocket(server);
app.get("/",(req,res)=>{
  res.send("Server is running bruhh :");
})
server.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
})