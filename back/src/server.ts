import express, { Request, Response } from "express";
import reminderRouter from "./routes/reminder.route";
import { authRouter } from "./routes/auth.route";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.get("/api", (req: Request, res: Response) => {
    res.send("Memora API");
});

app.use("/api/reminders", reminderRouter);
app.use("/api/auth", authRouter);

app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
