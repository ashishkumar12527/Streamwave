import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";


export async function POST(request) {
    try {
        const { email, password } = await request.json();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!email || !password) {
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

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User does not exist",
                    data: null
                },
                { status: 400 }
            );
        }
        const isPasswordCorrect = user.password
            ? await bcrypt.compare(password, user.password)
            : false;
        if (!isPasswordCorrect) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid credentials",
                    data: null
                },
                { status: 400 }
            );
        }
        const token = Jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        const response = NextResponse.json(
            {
                success: true,
                message: "User logged in successfully",
                data: { token }
            }
        );
        response.cookies.set("token", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60,
        });
        return response;


    } catch (e) {
        console.error(e);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
                data: null
            },
            { status: 500 }
        );
    }
    }
