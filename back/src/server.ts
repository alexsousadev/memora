import express from "express";
import reminderRouter from "./routes/reminder.route";
import { authRouter } from "./routes/auth.route";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/reminders", reminderRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
