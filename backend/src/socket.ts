import {Server} from "socket.io";
import {Server as HttpServer} from "http";

export function intializeSocket(server : HttpServer){
  const io = new Server(server, {
    cors : {
      origin : "*",
      methods : ["GET","POST"],
    },
  });
  io.on("connection",(socket)=>{
    console.log(`client connected : ${socket.id}`);

    socket.on("message",(data)=>{
      console.log(data);
      io.emit("message",data);

    })
    socket.on("disconnect",()=>{
      console.log(`Client disconnected : ${socket.id}`);
    })
  })
  return io;
  
}