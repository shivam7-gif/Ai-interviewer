import type { Request, Response } from "express";
import { db } from "../config/drizzle.js";
import { playlists, questions } from "../../database/schema.js";
import { eq } from "drizzle-orm";

const LEETCODE_API_BASE = "https://alfa-leetcode-api.onrender.com";

/**
 * GET /api/playlists
 * Returns all playlists.
 */
export const getAllPlaylists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await db.select().from(playlists);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/playlists/:id
 * Returns a single playlist by ID.
 */
export const getPlaylistById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: "Playlist ID is required" });
    return;
  }

  try {
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id));

    if (!playlist) {
      res.status(404).json({ success: false, message: "Playlist not found" });
      return;
    }

    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/playlists/:id/questions
 * Returns questions for a playlist, enriched with LeetCode content.
 */
export const getPlaylistQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: "Playlist ID is required" });
    return;
  }

  try {
    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id));

    if (!playlist) {
      res.status(404).json({ success: false, message: "Playlist not found" });
      return;
    }

    const qs = await db
      .select()
      .from(questions)
      .where(eq(questions.playlistId, id))
      .orderBy(questions.orderIndex);

    const withContent = await Promise.all(
      qs.map(async (q) => {
        try {
          const data = await fetch(
            `${LEETCODE_API_BASE}/select?titleSlug=${q.slug}`
          ).then((r) => r.json());

          return {
            id: q.id,
            slug: q.slug,
            orderIndex: q.orderIndex,
            title: data.questionTitle,
            difficulty: data.difficulty,
            question: data.question,
            topicTags: data.topicTags,
            hints: data.hints,
          };
        } catch {
          return {
            id: q.id,
            slug: q.slug,
            orderIndex: q.orderIndex,
            error: "Failed to fetch from LeetCode API",
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      playlistId: id,
      playlistTitle: playlist.title,
      questions: withContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
