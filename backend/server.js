import express from 'express';
import dotenv from 'dotenv';
import OpenAI from "openai";

const app = express();
dotenv.config();

app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE_URL
});

app.get('/query', async (req, res) => {
    const modelResponse = await client.responses.create({
        model: "openai/gpt-oss-20b",
        input: "Write a one-sentence bedtime story about a unicorn."
    });

    res.json({
        response: modelResponse.output_text
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Server is running!");
});