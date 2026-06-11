import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadsRouter } from './routes/uploads.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/uploads', uploadsRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Upload server listening on http://localhost:${PORT}`);
});


