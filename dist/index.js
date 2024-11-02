"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const express_1 = __importStar(require("express"));
const connect_1 = __importDefault(require("./db/connect"));
const numCPUs = (0, os_1.cpus)().length;
const port = 3000;
require("./db/connect");
require("./redis/redisConnect");
const redisConnect_1 = __importDefault(require("./redis/redisConnect"));
const mainServer = (0, express_1.default)();
const app = (0, express_1.Router)();
mainServer.use("/api", app);
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbStatus = yield connect_1.default.execute(`SELECT 1`);
        const redisStatus = yield redisConnect_1.default.ping();
        const status = {
            database: !!dbStatus,
            redis: redisStatus === "PONG"
        };
        const allHealthy = Object.values(status).every((isHealthy) => isHealthy);
        res.status(allHealthy ? 200 : 503).json(status);
    }
    catch (error) {
        console.error("Health check error:", error);
        res
            .status(503)
            .json({ error: "Service unavailable", details: error.message });
    }
}));
if (cluster_1.default.isPrimary) {
    for (let i = 0; i < numCPUs; i++) {
        cluster_1.default.fork();
    }
}
else {
    SERVER();
}
function SERVER() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisConnect_1.default.connect();
            mainServer.listen(port, () => {
                console.log(`Worker ${process.pid} listening on port ${port}`);
            });
            console.log(`Server running on port ${port}`);
        }
        catch (error) {
            console.log(error);
        }
    });
}
