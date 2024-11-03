import cluster from "cluster";
import { cpus } from "os";
import express, { Router } from "express";
import db from "./db/connect";
const numCPUs = cpus().length;
const port = 3000;

import "./db/connect";
import "./redis/redisConnect";
import cookieParser from "cookie-parser";
import { RedisClient } from "./redis/redisConnect";

//routes
import AuthRouter from "./routes/auth";
import {
  profilesTable,
  settingsTable,
  trailsTable,
  usersTable
} from "./db/schema";

const mainServer = express();
const app = Router();

mainServer.use("/api", app);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/auth", AuthRouter);

app.get("/delete", async (req, res) => {
  try {
    await db.delete(usersTable);
    await db.delete(profilesTable);
    await db.delete(settingsTable);
    await db.delete(trailsTable);
    res.send("deleted");
  } catch (error) {
    console.log(error);
  }
});

app.get("/status", async (req, res) => {
  try {
    const dbStatus = await db.execute(`SELECT 1`);
    const redisStatus = await RedisClient.ping();
    const status = {
      database: !!dbStatus,
      redis: redisStatus === "PONG"
    };
    const allHealthy = Object.values(status).every((isHealthy) => isHealthy);
    res.status(allHealthy ? 200 : 503).json(status);
  } catch (error: any) {
    console.error("Health check error:", error);
    res
      .status(503)
      .json({ error: "Service unavailable", details: error.message });
  }
});

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  SERVER();
}

async function SERVER() {
  try {
    mainServer.listen(port, () => {
      // console.log(`Worker ${process.pid} listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
