import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Basic health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});