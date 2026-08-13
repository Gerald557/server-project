import 'dotenv/config';
import express from 'express';
import apiRouter from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(apiRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});