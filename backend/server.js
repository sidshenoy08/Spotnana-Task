import express from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";
import cors from 'cors';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

const app = express();
dotenv.config();

app.use(express.json());

// const allowedOrigins = [
//     'http://localhost:3000/query'
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

app.use(cors());

const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE_URL
});

const saltRounds = 12;

function createMongoDBClient() {
    const client = new MongoClient(process.env.DB_URL);
    return client;
}

app.post('/register', async (req, res) => {
    const newUserEmail = req.body.email;
    const newUserPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(newUserPassword, saltRounds);

    const dbClient = createMongoDBClient();

    try {
        const database = dbClient.db('spotnana');
        const users = database.collection('users');
        const newUser = { email: newUserEmail, password: hashedPassword };
        const result = await users.insertOne(newUser);

        if (result.acknowledged) {
            res.status(201).json({ message: 'New user created successfully!' });
        }
    } catch (err) {
        console.log(err);
    } finally {
        dbClient.close();
    }
});

app.post('/login', async (req, res) => {
    const existingUserEmail = req.body.email;
    const existingUserPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(existingUserPassword, saltRounds);

    const dbClient = createMongoDBClient();

    try {
        const database = dbClient.db('spotnana');
        const users = database.collection('users');
        const user = users.findOne({email: existingUserEmail, password: hashedPassword});

        if (user) {
            res.status(200).json({message: 'Login successful'});
        }
    } catch (err) {
        console.log(err);
    } finally {
        dbClient.close;
    }
})

app.post('/query', async (req, res) => {
    const modelResponse = await client.responses.create({
        model: "openai/gpt-oss-20b",
        input: req.body.userPrompt
    });

    res.json({
        response: modelResponse.output_text
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Server is running!");
});