import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.get('/api/test', (req, res) => {
  res.json({ status: 'okay' });
});

const port = process.env.PORT || 3000;
app.listen(Number(port), () => {
  console.log(`API listening on http://localhost:${port}`);
});