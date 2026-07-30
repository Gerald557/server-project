import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import bcrypt from 'bcrypt';

export const createUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    
    const password = req.body.password || 'WelcomeTemporary123!';

    if (!email || !name) {
      sendResponse(res, 400, false, "Please enter both email and name!");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword
      }
    });

    sendResponse(res, 201, true, "User registered successfully!", newUser);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    sendResponse(res, 200, true, "Users retrieved successfully!", users);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};