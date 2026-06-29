export const getAllPlaylists = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;


    return res.status(200).json({
      success: true,
      playlistId: id,
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPlaylistQuestions = async (req, res) => {
  try {
    const { id } = req.params;


    return res.status(200).json({
      success: true,
      playlistId: id,
      questions: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};