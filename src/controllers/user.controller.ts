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
    
    const password = req.body.password;

    if (!email || !name || !password) {
      sendResponse(res, 400, false, "Please enter email, name, and password!");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    sendResponse(res, 200, true, "Users retrieved successfully!", users);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

// 1. Function name changed to PascalCase: LoginUser
export const LoginUser = async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      sendResponse(res, 400, false, "Please enter your email and password!");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      sendResponse(res, 401, false, "Invalid email or password!");
      return;
    }

    // 2. Variable name changed to snake_case: is_password_match
    const is_password_match = await bcrypt.compare(password, user.password);

    if (!is_password_match) {
      sendResponse(res, 401, false, "Invalid email or password!");
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
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


// 1. Function name changed to PascalCase: ResetPassword
export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.body.token || req.query.token;
    const new_password = req.body.newPassword;

    if (!token || !new_password) {
      sendResponse(res, 400, false, "Token and new password are required!");
      return;
    }

    const decoded = jwt.verify(token as string, JWT_SECRET) as { id:  any };

    // 2. Variable name changed to snake_case: hashed_new_password
    const hashed_new_password = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed_new_password }
    });

    sendResponse(res, 200, true, "Password reset successfully!");
  } catch (error: any) {
    sendResponse(res, 400, false, "Invalid or expired password reset token!");
  }
};


// 1. Function name changed to PascalCase: ForgotPassword
export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';

    if (!email) {
      sendResponse(res, 400, false, "Please enter your email!");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      sendResponse(res, 404, false, "User not found!");
      return;
    }

    // 2. Variable name changed to snake_case: reset_token
    const reset_token = jwt.sign(
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

    // 3. Variable names changed to snake_case: app_url and reset_url
    const app_url = process.env.APP_URL || "http://localhost:3000";
    const reset_url = `${app_url}/reset-password?token=${reset_token}`;
    
    await transporter.sendMail({
      from: '"Task Manager API" <noreply@taskmanager.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${reset_url}">here</a> to reset your password. This link will expire in 15 minutes.</p>`
    });

    sendResponse(res, 200, true, "Reset link sent to your email!");
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};
