import 'dotenv/config';
import express from 'express';
import userRoutes from './routes/user';
import machineRouter from "./routes/machine";

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.json());
app.use("/api/machines", machineRouter);

app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});