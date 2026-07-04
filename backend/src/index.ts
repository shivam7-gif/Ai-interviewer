import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import http from "http";
import {preInterviewBody} from "../types.js";
import { intializeSocket } from "./socket.js";
import playlistRoutes from "../routes/Playlist.routes.js";
dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({
  origin : "*",
}));
app.use(cors());
app.use(express.json());

// routes
app.use("/api/playlists", playlistRoutes);
const server = http.createServer(app);
intializeSocket(server);


app.post("/api/v1/pre-interview",async(req,res)=>{
  const {success ,data} = preInterviewBody.safeParse(req.body);
  if(!success){
    res.status(411).json({
      message : "incorrect body",
    });
    return;
  }
  const gitHubUrl = data.gitHub;
  
    // Extract username from GitHub URL
    const gitHubUsername = gitHubUrl.endsWith("/") 
        ? gitHubUrl.slice(0, -1).split("/").pop() 
        : gitHubUrl.split("/").pop();

    console.log("GitHub username : ",gitHubUsername);
      try {
        const userRepos = await axios.get(`https://api.github.com/users/${gitHubUsername}/repos`);
        
        // console.log("GitHub API response status:", userRepos.status);
        // console.log("GitHub API response data length:", userRepos.data.length);
        // console.log("Full GitHub API response:", JSON.stringify(userRepos.data, null, 2));

        const filteredUserRepos = userRepos.data.map((x : any)=>({
                description : x.description,
                name : x.name ,
                fullName : x.full_name ,
                starcount : x.stargazers_count
        }));
        console.log("Filtered repos:", filteredUserRepos);

        res.json({
            success: true,
            repos: filteredUserRepos
        });
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        res.status(500).json({
            message: "Failed to fetch GitHub repositories",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

app.get("/", (req, res) => {
  res.send("Server is running bruhh :");
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
