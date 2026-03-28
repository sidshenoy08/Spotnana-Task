import { MongoClient } from "mongodb";

import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.DB_URL);

let database;

export async function getMongoDBCollection(collection) {
    if (!database) {
        await client.connect();
        database = client.db('spotnana');
        return database.collection(collection);
        // console.log("MongoDB connected");
    }
    return database;
}