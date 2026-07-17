import { Router } from "express";
import {
  getAllPlaylists,
  getPlaylistById,
  getPlaylistQuestions,
} from "../controllers/playlist.controller.js";

const router = Router();

// GET /api/playlists
router.get("/", getAllPlaylists);

// GET /api/playlists/:id
router.get("/:id", getPlaylistById);

// GET /api/playlists/:id/questions
router.get("/:id/questions", getPlaylistQuestions);

export default router;
