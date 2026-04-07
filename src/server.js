const express = require("express");
const cors = require("cors");
const path = require("path");

const { PORT } = require("./config/env");

const uploadRoutes = require("./routes/upload.routes");
const generateRoutes = require("./routes/generate.routes");
const parserRoutes = require("./routes/parser.routes");
const proposalRoutes = require("./routes/proposal.routes");

const { swaggerSpec, swaggerUi } = require("./config/swagger");
const { createMcpServer } = require("./mcp/createMcpServer");
const { createMcpHttpHandlers } = require("./mcp/httpAdapter");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => res.json(swaggerSpec));

const DISABLE_ENTRA_AUTH = process.env.DISABLE_ENTRA_AUTH === "true";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5173"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed for this origin"), false);
    },
    credentials: true
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

function requireAuth(req, res, next) {
  if (DISABLE_ENTRA_AUTH) {
    return next();
  }

  const principal = req.headers["x-ms-client-principal"];

  if (!principal) {
    return res.status(401).json({
      message: "Unauthorized. Please login using Microsoft Entra ID."
    });
  }

  return next();
}

app.get("/api/me", (req, res) => {
  if (DISABLE_ENTRA_AUTH) {
    return res.json({
      authenticated: true,
      message: "Entra Auth Disabled (DEV MODE)",
      user: {
        name: "DEV_USER",
        roles: ["developer"]
      }
    });
  }

  const principal = req.headers["x-ms-client-principal"];

  if (!principal) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = Buffer.from(principal, "base64").toString("utf8");
    const user = JSON.parse(decoded);

    return res.json({
      authenticated: true,
      user
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to decode user principal", err });
  }
});

app.use("/", express.static(path.join(__dirname, "ui")));

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    message: "RFP Generator API running",
    authEnabled: !DISABLE_ENTRA_AUTH
  });
});

const routeModules = [
  uploadRoutes,
  generateRoutes,
  parserRoutes,
  proposalRoutes
];

const allRegisteredRoutes = routeModules.flatMap((routeModule) => routeModule.routes || []);

const mcpServer = createMcpServer({
  name: "rfp-demo-mcp",
  version: "1.0.0",
  routes: allRegisteredRoutes
});

const { mcpHandler } = createMcpHttpHandlers({
  mcpServer,
  requireAuth
});

app.all("/mcp", ...mcpHandler);

app.use("/api/upload", requireAuth, uploadRoutes);
app.use("/api/generate", requireAuth, generateRoutes);
app.use("/api/parser", requireAuth, parserRoutes);
app.use("/api/proposals", requireAuth, proposalRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Entra Auth: ${DISABLE_ENTRA_AUTH ? "DISABLED (DEV MODE)" : "ENABLED"}`);
  console.log(`Native MCP endpoint available at http://localhost:${PORT}/mcp`);
});

// Made with Bob
