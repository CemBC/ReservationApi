import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { empty } from "@prisma/client/runtime/client";

export async function registerUser(data) {
    const existingUser = await prisma.user.findUnique( {
        where: {
            email: data.email
        }
    });
    if(existingUser) return {error: "EMAIL_ALREADY_EXISTS"};

    const passwordHash = await bcrypt.hash(data.password , 10);

    const user = await prisma.user.create({
        data: {
            fullName: data.fullName,
            email: data.email,
            passwordHash,
            role: "USER"
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    return {user};
}

export async function loginUser(data) {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });
    if(!user) return {error: "INVALID_CREDENTIALS"};
    const passwordMatches = await bcrypt.compare(data.password , user.passwordHash);
    if(!passwordMatches) return {error: "INVALID_CREDENTIALS"};
    
    const token = jwt.sign({
        userId: user.id,
        role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }

    );

    return {
        token,
        user: {
            id: user.id,
            fullName: user.fullName  ,
            email: user.email,
            role: user.role
        }
    };
}