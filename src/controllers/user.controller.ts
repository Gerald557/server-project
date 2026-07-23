import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Register a new user in the database
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required." });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password,
        role
      }
    });

    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error: any) {
    if (error.code === 'P2002') {
       res.status(400).json({ error: "A user with this email address already exists." });
       return;
    }
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
};

// Retrieve all user records
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
};