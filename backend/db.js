import { MongoClient } from "mongodb";

import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.DB_URL);

let database;

export async function connectDB() {
    if (!database) {
        // await client.connect();
        database = client.db('spotnana');
        console.log("MongoDB connected");
    }
    return database;
}

export async function getMongoDBCollection() {
    return database.collection('users');
}