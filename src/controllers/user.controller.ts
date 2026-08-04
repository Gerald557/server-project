import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendResponse } from '../utils/response';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
        const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    sendResponse(res, 200, true, "Login successful!", {
      id: user.id,
      email: user.email,
      name: user.name,
      token: token
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.body.token || req.query.token;
    const newPassword = req.body.newPassword;

    if (!token || !newPassword) {
      sendResponse(res, 400, false, "Token and new password are required!");
      return;
    }

    const decoded = jwt.verify(token as string, JWT_SECRET) as { id: string };

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedNewPassword }
    });

    sendResponse(res, 200, true, "Password reset successfully!");
  } catch (error: any) {
    sendResponse(res, 400, false, "Invalid or expired password reset token!");
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;

    if (!email) {
      sendResponse(res, 400, false, "Please enter your email!");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      sendResponse(res, 404, false, "User not found!");
      return;
    }

    const resetToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: '"Task Manager API" <noreply@taskmanager.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 15 minutes.</p>`
    });

    sendResponse(res, 200, true, "Reset link sent to your email!");
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};