import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Vercel serverless writable path fallback check (/tmp directory support)
const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel
    ? path.join("/tmp", "data")
    : path.join(process.cwd(), "src", "data");

const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

// Ensure Writable Directories
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(REGISTRATIONS_FILE)) {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ googleSheetUrl: "", adminPasscode: "ratlamrun2026" }, null, 2));
}

// ... Aapke saare Custom Helper functions (getRegistrations, saveRegistrations) aur API Routes (/api/register) exact same yahan aayenge ...

// --- VITE MIDDLEWARE & STATIC ASSET RESOLUTION ---
async function startServer() {
    if (process.env.NODE_ENV !== "production" && !isVercel) {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        // Vercel routes logic handles dist folder redirection natively, 
        // but keeping explicit fallback local safety mechanism
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
    }

    if (!isVercel) {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}

startServer();

export default app;