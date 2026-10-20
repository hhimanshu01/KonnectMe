import dotenv from 'dotenv';
if(process.env.NODE_ENV != "production")
{
    dotenv.config();
}

import express from "express";
import {createServer} from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/users.routes.js"

const app = express();

const server = createServer(app);

const io = connectToSocket(server);

const dbUrl = process.env.ATLASDB_URL;

app.set("port" , process.env.PORT || 8000); // .set is for local variable
app.use(cors());
app.use(express.json({limit : "40kb"}));
app.use(express.urlencoded({limit : "40kb" , extended : true}));

app.use("/api/v1/users" , userRoutes);

const start = async () => {

    mongoose.connection.on("connected" , () => {console.log("Data conn")});

    await mongoose.connect(dbUrl);

    
     server.listen(app.get("port") , () => {
        console.log("Listening on port 8000");
    })
}


start();