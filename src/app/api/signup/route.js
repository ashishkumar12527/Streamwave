import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import UserData from "@/models/UserData";

export async function POST(request) {
    try {
        const { userName, email, password, imageUrl } = await request.json();

        if (!userName || !email || !password || !imageUrl) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please fill all the fields",
                    data: null
                },
                { status: 400 }
            );
        }
        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User already exists",
                    data: null
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = await UserData.create({});
        const result = await User.create({ 
            userName,
            email,
            password: hashedPassword,
            imageUrl,
            userData: userData._id
         });
        return NextResponse.json(
            {
                success: true,
                message: "User created successfully",
                data: result
            }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error.message === "Database connection failed" ||
                    error.message === "Database configuration is missing"
                        ? "Database is unavailable. Check your MongoDB environment variables."
                        : "Something went wrong while creating the account",
                data: null
            },
            { status: 500 }
        );
    }
    }
