"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)("./index.js");
const __dirname = path_1.default.dirname(__filename);
const cpuCount = os_1.default.cpus().length;
console.log(`The total number of CPUs is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);
cluster_1.default.setupPrimary({
    exec: path_1.default.join(__dirname, "index.js")
});
for (let i = 0; i < cpuCount; i++) {
    cluster_1.default.fork();
}
cluster_1.default.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    cluster_1.default.fork();
});
