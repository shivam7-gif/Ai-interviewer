import express from "express";
const router = express.Router();
import {
  getAllPlaylists,
  getPlaylistById,
  getPlaylistQuestions,
} from "../controller/playlist.controller.js";

router.get("/", getAllPlaylists);
router.get("/:id", getPlaylistById);
router.get("/:id/questions", getPlaylistQuestions);

export default router;
