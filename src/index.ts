import 'dotenv/config';
import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());
app.use('/users', userRoutes);

// Basic health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});