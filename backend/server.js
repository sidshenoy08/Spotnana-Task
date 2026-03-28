import express from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";
import cors from 'cors';
import bcrypt from 'bcrypt';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import { authMiddleware } from './middleware/auth.js';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE_URL
});

const saltRounds = 12;

app.post('/register', async (req, res) => {
    const newUserEmail = req.body.email;
    const newUserPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(newUserPassword, saltRounds);

    try {
        const client = new MongoClient(process.env.DB_URL);
        await client.connect();
        const database = client.db('spotnana');
        const users = database.collection('users');
        const newUser = { email: newUserEmail, password: hashedPassword };
        const result = await users.insertOne(newUser);

        if (result.acknowledged) {
            const user = await users.findOne({ email: newUserEmail });

            if (!user) {
                res.status(404).json({ error: 'User not found' });
            }

            const userToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.cookie('token', userToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            res.status(201).json({ message: 'New user created successfully!' });
        }
    } catch (err) {
        console.log(err);
    }
});

app.post('/login', async (req, res) => {
    const existingUserEmail = req.body.email;
    const existingUserPassword = req.body.password;
    try {
        const client = new MongoClient(process.env.DB_URL);
        await client.connect();
        const database = client.db('spotnana');
        const users = database.collection('users');
        const user = await users.findOne({ email: existingUserEmail });

        if (user) {
            const isMatch = await bcrypt.compare(existingUserPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const userToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.cookie('token', userToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            res.status(200).json({ message: 'Login successful' });
        }
    } catch (err) {
        console.log(err);
    }
});

app.get('/me', authMiddleware, (req, res) => {
    res.json({ userId: req.user.userId });
});

app.post('/query', authMiddleware, async (req, res) => {
    const modelResponse = await client.responses.create({
        model: "openai/gpt-oss-20b",
        input: req.body.userPrompt
    });

    res.json({
        response: modelResponse.output_text
    });
});

app.get('/retrieve', authMiddleware, async (req, res) => {
    try {
        const client = new MongoClient(process.env.DB_URL);
        await client.connect();
        const database = client.db('spotnana');
        const chats = database.collection('chats');

        const userChats = await chats.find({ userId: req.user.userId }).toArray();

        if (userChats) {
            res.status(200).json({ userChats });
        }
    } catch (err) {
        console.log(err);
    }
});

app.post('/save', authMiddleware, async (req, res) => {
    try {
        const client = new MongoClient(process.env.DB_URL);
        await client.connect();
        const database = client.db('spotnana');
        const chats = database.collection('chats');

        if (!req.body.chatId) {
            const result = await chats.insertOne({ userId: req.user.userId, messages: [{ userPrompt: req.body.userPrompt, queryResponse: req.body.queryResponse }] });
            if (result.acknowledged) {
                res.status(200).json({ message: result.insertedId });
            }
        } else {
            const result = await chats.updateOne({
                _id: new ObjectId(req.body.chatId),
                userId: req.user.userId
            },
                { $push: { messages: { userPrompt: req.body.userPrompt, queryResponse: req.body.queryResponse } } },
            );
        }

    } catch (err) {
        console.log(err);
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Server is running!");
});