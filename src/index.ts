import cluster from "cluster";
import { cpus } from "os";
import express, { Router } from "express";
import db from "./db/connect";
const numCPUs = cpus().length;
const port = 3000;

import "./db/connect";
import "./redis/redisConnect";
import Redis from "./redis/redisConnect";

const mainServer = express();
const app = Router();
mainServer.use("/api", app);

app.get("/status", async (req, res) => {
  try {
    const dbStatus = await db.execute(`SELECT 1`);
    const redisStatus = await Redis.ping();

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
    await Redis.connect();
    mainServer.listen(port, () => {
      console.log(`Worker ${process.pid} listening on port ${port}`);
    });
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.log(error);
  }
}
