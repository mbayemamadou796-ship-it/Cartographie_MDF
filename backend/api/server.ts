import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Cartographie MDF Backend API', version: '1.0.0 MVP' });
});

export default app;
