require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Make sure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is missing from .env");
  process.exit(1);
}

// Detect the database host
let databaseUrl;

try {
  databaseUrl = new URL(process.env.DATABASE_URL);
} catch (error) {
  console.error("Error: DATABASE_URL is invalid.");
  process.exit(1);
}

const databaseHost = databaseUrl.hostname;

const isLocalDatabase =
  databaseHost === "localhost" ||
  databaseHost === "127.0.0.1";

const isNeonDatabase = databaseHost.endsWith(".neon.tech");

// Remove URL SSL settings so the explicit configuration below applies.
databaseUrl.searchParams.delete("sslmode");

const pool = new Pool({
  connectionString: databaseUrl.toString(),

  // Neon requires SSL. Local PostgreSQL usually does not.
  ssl: isLocalDatabase
    ? false
    : isNeonDatabase
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: false },

  connectionTimeoutMillis: 10000,
});

// Log unexpected database connection errors
pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error.message);
});

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Management API is running",
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.json({
      success: true,
      message: "API and database are working",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Start the server after testing the database
async function startServer() {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    console.log("Connected to PostgreSQL");
    console.log("Database host:", databaseHost);
    console.log("Database time:", result.rows[0].database_time);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  }
}

startServer();