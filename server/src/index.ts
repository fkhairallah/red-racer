import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve the built React PWA
const clientDist = join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: '[Red] Racer Server' });
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Red] Racer server running on http://localhost:${PORT}`);
});
