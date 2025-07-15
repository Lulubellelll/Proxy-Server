require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.get("/lyrics", async (req, res) => {
  const { title, artist } = req.query;

  if (!title || !artist) {
    return res.status(400).json({ error: "Title and artist are required" });
  }

  try {
    const response = await axios.get("https://api.genius.com/search", {
      params: {
        q: `${title} ${artist}`,
      },
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", // Mimic a browser
      },
    });

    const hits = response.data.response.hits;
    const song = hits.find(
      (hit) =>
        hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase()) ||
        hit.result.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const songUrl = song.result.url;

    res.json({ songUrl });
  } catch (error) {
    console.error("GENIUS API ERROR:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch lyrics" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
