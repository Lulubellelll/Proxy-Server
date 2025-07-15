require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('genius-lyrics');

const app  = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', true);

app.use(cors());

app.get('/healthz', (_req, res) => res.send('OK'));

const genius = new Client(process.env.GENIUS_ACCESS_TOKEN);
app.get('/lyrics', async (req, res) => {
  const { title, artist } = req.query;
  if (!title || !artist) {
    return res.status(400).json({ error: 'Title and artist are required' });
  }

  try {
    const results = await genius.songs.search(`${title} ${artist}`);
    const song = results.find(
      (s) =>
        s.artist?.name?.toLowerCase().includes(artist.toLowerCase()) ||
        s.title.toLowerCase().includes(title.toLowerCase())
    );

    if (!song) return res.status(404).json({ error: 'Song not found' });

    const lyrics = await song.lyrics();
    res.json({ lyrics });
  } catch (err) {
    console.error('GENIUS API ERROR:', err?.message || err);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
