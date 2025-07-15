require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Client } = require("genius-lyrics");

const app = express();
const port = process.env.PORT || 3001;

const genius = new Client(process.env.GENIUS_ACCESS_TOKEN);

app.use(cors());

app.get("/lyrics", async (req, res) => {
  const { title, artist } = req.query;

  if (!title || !artist) {
    return res.status(400).json({ error: "Title and artist are required" });
  }

  try {
    const results = await genius.songs.search(`${title} ${artist}`);
    const song = results.find(
      (s) =>
        s.artist?.name.toLowerCase().includes(artist.toLowerCase()) ||
        s.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const lyrics = await song.lyrics();
    res.json({ lyrics });
  } catch (error) {
    console.error("GENIUS API ERROR:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch lyrics" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
