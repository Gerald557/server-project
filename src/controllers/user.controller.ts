import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';


export const createUser = async (req: Request, res: Response) => {
  try {
   
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    
    if (!email || !password || !name) {
      res.status(400).json({ error: "Please enter your email, password, and name!" });
      return;
    }

   
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: password
      }
    });

    
    res.status(201).json(newUser);
  } catch (error: any) {
    
    res.status(500).json({ error: error.message });
  }
};


export const getUsers = async (req: Request, res: Response) => {
  try {
    
    const users = await prisma.user.findMany();
    
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};