import { availableParallelism } from "node:os";
import cluster from "cluster";
const numCPUs = availableParallelism();
import "./db/connect";
import "./redis/redisConnect";

if (cluster.isPrimary) {
  // Log "started" only once, when the cluster starts
  console.log("Focus Backend started on " + numCPUs + " CPUs Cores ✅");

  cluster.setupPrimary({
    exec: __dirname + "/index.js"
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker if it dies
  });
} else {
  // Workers can share the same server
  require(__dirname + "/index.js");
}
