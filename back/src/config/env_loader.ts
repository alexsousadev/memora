import path from "node:path";
import dotenv from "dotenv";

class EnvLoader {
    constructor() {
        this.loadEnv();
    }

    loadEnv() {
        const envPath = path.resolve(__dirname, "../../../.env");
        dotenv.config({ path: envPath });
    }

    getEnv(key: string): string {
        return process.env[key] ?? "";
    }
}

const envLoader = new EnvLoader();

export default envLoader;