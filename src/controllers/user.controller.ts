import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import bcrypt from 'bcrypt';

export const createUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    
    let password = req.body.password;

    if (!password) {
      password = "temp_" + Math.random().toString(36).substring(2, 10);
    }

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

    sendResponse(
      res, 
      201, 
      true, 
      "User registered successfully!", 
      newUser
    );
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      sendResponse(res, 400, false, "Please enter your email and password!");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      sendResponse(res, 401, false, "Invalid email or password!");
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      sendResponse(res, 401, false, "Invalid email or password!");
      return;
    }

    sendResponse(res, 200, true, "Login successful!", {
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (!email || !oldPassword || !newPassword) {
      sendResponse(res, 400, false, "Please enter email, old password, and new password!");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      sendResponse(res, 404, false, "User not found!");
      return;
    }

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordCorrect) {
      sendResponse(res, 401, false, "Old password is incorrect!");
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: email },
      data: { password: hashedNewPassword }
    });

    sendResponse(res, 200, true, "Password reset successfully!");
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};