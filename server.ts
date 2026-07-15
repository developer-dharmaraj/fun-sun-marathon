import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger JSON and URL-encoded limits to support base64 screenshot uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DATA_DIR = path.join(process.cwd(), "src", "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure registrations file exists
if (!fs.existsSync(REGISTRATIONS_FILE)) {
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2));
}

// Ensure config file exists with default passcode
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(
      {
        googleSheetUrl: "",
        adminPasscode: "ratlamrun2026",
      },
      null,
      2
    )
  );
}

// Helper functions to read/write registrations
function getRegistrations() {
  try {
    const data = fs.readFileSync(REGISTRATIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading registrations:", err);
    return [];
  }
}

function saveRegistrations(registrations: any[]) {
  try {
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing registrations:", err);
    return false;
  }
}

// Helper functions to read/write config
function getConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading config:", err);
    return { googleSheetUrl: "", adminPasscode: "ratlamrun2026" };
  }
}

function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing config:", err);
    return false;
  }
}

// --- API ROUTES ---

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Clean screenshot viewer page
app.get("/api/view-screenshot/:id", (req, res) => {
  const { id } = req.params;
  const registrations = getRegistrations();
  const registration = registrations.find((r: any) => r.id === id);

  if (!registration) {
    return res.status(404).send(`
      <html>
        <head>
          <title>Not Found - Ratlam Fun Run</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { font-family: 'Poppins', sans-serif; }</style>
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen text-slate-800 p-6">
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full text-center">
            <h1 class="text-2xl font-extrabold text-red-600 mb-2">Registration Not Found</h1>
            <p class="text-slate-500 text-sm mb-6">The registration record with ID "${id}" could not be found or has been removed.</p>
            <a href="/" class="inline-flex items-center justify-center px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition text-sm">
              Go to Website
            </a>
          </div>
        </body>
      </html>
    `);
  }

  res.send(`
    <html>
      <head>
        <title>Payment Screenshot: ${registration.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>body { font-family: 'Poppins', sans-serif; }</style>
      </head>
      <body class="bg-slate-50 min-h-screen text-slate-800 py-10 px-4 md:px-6">
        <div class="max-w-xl mx-auto space-y-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span class="text-xs font-semibold text-orange-600 uppercase tracking-wider">Ratlam Fun Run 2026</span>
                <h1 class="text-xl font-extrabold text-slate-900 mt-0.5">${registration.name}</h1>
              </div>
              <span class="px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-100">Pending Verification</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-slate-400 text-xs">Registration ID</p>
                <p class="font-mono font-bold text-slate-800">${registration.id}</p>
              </div>
              <div>
                <p class="text-slate-400 text-xs">Contact Number</p>
                <p class="font-medium text-slate-800">${registration.contactNumber}</p>
              </div>
              <div>
                <p class="text-slate-400 text-xs">Email Address</p>
                <p class="font-medium text-slate-800">${registration.email}</p>
              </div>
              <div>
                <p class="text-slate-400 text-xs">Age / Gender</p>
                <p class="font-medium text-slate-800">${registration.age} yrs / ${registration.gender}</p>
              </div>
              <div>
                <p class="text-slate-400 text-xs">Emergency contact</p>
                <p class="font-medium text-slate-800">${registration.emergencyNumber}</p>
              </div>
              <div>
                <p class="text-slate-400 text-xs">Submitted At</p>
                <p class="font-medium text-slate-800">${new Date(registration.submittedAt).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h2 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              UPI Payment Receipt Screenshot
            </h2>
            <div class="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center p-2">
              <img src="${registration.screenshot}" class="max-w-full h-auto rounded-xl shadow-xs" alt="Payment Proof" />
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Get admin configuration (with masked Google Sheet URL for security)
app.get("/api/config", (req, res) => {
  const config = getConfig();
  let maskedUrl = "";
  if (config.googleSheetUrl) {
    try {
      const url = new URL(config.googleSheetUrl);
      maskedUrl = `${url.origin}${url.pathname.substring(0, 15)}...`;
    } catch {
      maskedUrl = "Configured (Invalid URL)";
    }
  }
  res.json({
    hasSheetUrl: !!config.googleSheetUrl,
    googleSheetUrlMasked: maskedUrl,
  });
});

// Save or update admin configuration
app.post("/api/config", (req, res) => {
  const { passcode, googleSheetUrl, newPasscode } = req.body;
  const config = getConfig();

  // Validate current passcode
  if (passcode !== config.adminPasscode) {
    return res.status(401).json({ error: "Invalid admin passcode" });
  }

  if (googleSheetUrl !== undefined) {
    config.googleSheetUrl = googleSheetUrl;
  }

  if (newPasscode) {
    config.adminPasscode = newPasscode;
  }

  saveConfig(config);
  res.json({
    success: true,
    hasSheetUrl: !!config.googleSheetUrl,
    message: "Configuration updated successfully",
  });
});

// Submit a new registration (Public Route)
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, contactNumber, age, gender, emergencyNumber, screenshot } = req.body;

    // Server-side validation
    if (!name || !email || !contactNumber || !age || !gender || !emergencyNumber || !screenshot) {
      return res.status(400).json({ error: "All registration fields and screenshot are required" });
    }

    const newReg = {
      id: `RR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      contactNumber,
      age: parseInt(age, 10),
      gender,
      emergencyNumber,
      screenshot, // Keep base64 image data
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    const registrations = getRegistrations();
    registrations.unshift(newReg); // Prepend new registration
    saveRegistrations(registrations);

    // Forward to Google Sheet Webhook if configured
    const config = getConfig();
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || config.googleSheetUrl;
    let forwardedToSheet = false;
    let sheetError = "";

    if (googleSheetUrl) {
      try {
        let appUrl = process.env.APP_URL;
        if (!appUrl || appUrl === "MY_APP_URL" || !appUrl.startsWith("http")) {
          const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
          const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "localhost:3000";
          appUrl = `${proto}://${host}`;
        }
        if (appUrl.endsWith("/")) {
          appUrl = appUrl.slice(0, -1);
        }
        const screenshotViewUrl = `${appUrl}/api/view-screenshot/${newReg.id}`; // Updated to direct view route

        const payload = {
          id: newReg.id,
          name: newReg.name,
          email: newReg.email,
          contactNumber: newReg.contactNumber,
          age: newReg.age,
          gender: newReg.gender,
          emergencyNumber: newReg.emergencyNumber,
          submittedAt: newReg.submittedAt,
          status: newReg.status,
          screenshotUrl: screenshotViewUrl,
        };

        // Forward with timeout protection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const sheetRes = await fetch(googleSheetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (sheetRes.ok) {
          forwardedToSheet = true;
        } else {
          const text = await sheetRes.text();
          sheetError = `HTTP ${sheetRes.status}: ${text.substring(0, 100)}`;
        }
      } catch (err: any) {
        console.error("Error forwarding to Google Sheet:", err);
        sheetError = err.message || "Failed to connect to webhook";
      }
    }

    res.json({
      success: true,
      registrationId: newReg.id,
      forwardedToSheet,
      sheetError: sheetError || undefined,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

// Retrieve registrations (Admin Route - passcode required)
app.get("/api/registrations", (req, res) => {
  const { passcode } = req.query;
  const config = getConfig();

  if (passcode !== config.adminPasscode) {
    return res.status(418).json({ error: "Unauthorised admin access" });
  }

  const registrations = getRegistrations();
  res.json({ registrations });
});

// Update registration status (verify/reject) (Admin Route - passcode required)
app.post("/api/registrations/:id/status", async (req, res) => {
  const { id } = req.params;
  const { passcode, status } = req.body;
  const config = getConfig();

  if (passcode !== config.adminPasscode) {
    return res.status(401).json({ error: "Invalid admin passcode" });
  }

  if (status !== "verified" && status !== "rejected" && status !== "pending") {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const registrations = getRegistrations();
  const index = registrations.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Registration not found" });
  }

  registrations[index].status = status;
  saveRegistrations(registrations);

  // If Google Sheets is configured, update the sheet status if desired
  // We can also trigger a re-POST to the sheet if they update status
  if (config.googleSheetUrl) {
    try {
      const reg = registrations[index];
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const screenshotViewUrl = `${appUrl}/admin?regId=${reg.id}`;

      const payload = {
        id: reg.id,
        name: reg.name,
        email: reg.email,
        contactNumber: reg.contactNumber,
        age: reg.age,
        gender: reg.gender,
        emergencyNumber: reg.emergencyNumber,
        submittedAt: reg.submittedAt,
        status: reg.status,
        screenshotUrl: screenshotViewUrl,
        isUpdate: true, // Tagging it as an update in status
      };

      await fetch(config.googleSheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error forwarding status update to Google Sheet:", err);
    }
  }

  res.json({ success: true, registration: registrations[index] });
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
