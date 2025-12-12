import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import reminderRouter from "./routes/reminder.route";
import { authRouter } from "./routes/auth.route";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/reminders", reminderRouter);
app.use("/api/auth", authRouter);

const frontDistPath = path.join(__dirname, "../../front/dist");
app.use(express.static(frontDistPath));

app.get("/", (_req, res) => {
    res.sendFile(path.join(frontDistPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;