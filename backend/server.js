import express from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";
import cors from 'cors';

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