import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import http from "http";
import { preInterviewBody } from "../types.js";
import { intializeSocket } from "./socket.js";
import playlistRoutes from "../routes/Playlist.routes.js";
import { prisma } from "../db.js";
import liveKitRouter from "../routes/livekit.js";


dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(cors());
app.use(express.json());

// routes
app.use("/api/playlists", playlistRoutes);
app.use("/api/livekit",liveKitRouter);

const server = http.createServer(app);
intializeSocket(server);

app.post("/api/v1/pre-interview", async (req: Request, res: Response) => {
  const parsed = preInterviewBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(411).json({
      message: "incorrect body",
    });
    return;
  }

  const { gitHub } = parsed.data;

  const gitHubUsername = gitHub.endsWith("/")
    ? gitHub.slice(0, -1).split("/").pop()
    : gitHub.split("/").pop();

  console.log("GitHub username : ", gitHubUsername);

  try {
    const userRepos = await axios.get(
      `https://api.github.com/users/${gitHubUsername}/repos`
    );

    const filteredUserRepos = userRepos.data.map((x: any) => ({
      description: x.description,
      name: x.name,
      fullName: x.full_name,
      starcount: x.stargazers_count,
    }));

    console.log("Filtered repos:", filteredUserRepos);

    const createdInterview = await prisma.interView.create({
      data: {
        metaData: {
          githubUrl: gitHub,
          repos: filteredUserRepos,
        },
        status: "Pre",
        score: 0,
      },
    });

    res.json({
      success: true,
      projectId: createdInterview.id,
      repos: filteredUserRepos,
    });
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    res.status(500).json({
      message: "Failed to fetch GitHub repositories",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running bruhh :");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
