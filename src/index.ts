import 'dotenv/config';
import express from 'express';
import userRoutes from './routes/user'; // Clean, simple import path!

const app = express();
const PORT = 3000;

app.use(express.json());


app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});