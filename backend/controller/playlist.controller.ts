import { db } from "../database/index.js";
import { playlists, questions } from "../database/schema.js";
import { eq } from "drizzle-orm";

const BASE_URL = "https://alfa-leetcode-api.onrender.com";

export const getAllPlaylists = async (req, res) => {
  try {
    const result = await db.select().from(playlists);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/playlists/:id
export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;

    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id));

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/playlists/:id/questions
export const getPlaylistQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    const [playlist] = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id));

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    // get slugs from DB
    const qs = await db
      .select()
      .from(questions)
      .where(eq(questions.playlistId, id))
      .orderBy(questions.orderIndex);

    // fetch content from LeetCode API for each slug
    const withContent = await Promise.all(
      qs.map(async (q) => {
        try {
          const data = await fetch(
            `${BASE_URL}/select?titleSlug=${q.slug}`
          ).then((r) => r.json());

          return {
            id: q.id,
            slug: q.slug,
            leetcodeUrl: q.leetcodeUrl,
            orderIndex: q.orderIndex,
            title: data.questionTitle,
            difficulty: data.difficulty,
            question: data.question,
            topicTags: data.topicTags,
            hints: data.hints,
          };
        } catch {
          // if one question fails, don't crash everything
          return {
            id: q.id,
            slug: q.slug,
            orderIndex: q.orderIndex,
            error: "Failed to fetch from LeetCode API",
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      playlistId: id,
      playlistTitle: playlist.title,
      questions: withContent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
