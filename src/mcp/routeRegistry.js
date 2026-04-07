const express = require("express");

function defineRoute(config) {
  return config;
}

function createRegisteredRouter(basePath, routes) {
  const router = express.Router();
  const registeredRoutes = [];

  for (const route of routes) {
    const {
      method,
      path,
      middlewares = [],
      handler,
      mcp = {}
    } = route;

    if (!method || typeof router[method] !== "function") {
      throw new Error(`Unsupported route method: ${method}`);
    }

    const normalizedRoute = {
      ...route,
      method: method.toLowerCase(),
      basePath,
      fullPath: buildFullPath(basePath, path),
      mcp: {
        enabled: true,
        ...mcp
      }
    };

    router[normalizedRoute.method](path, ...middlewares, handler);
    registeredRoutes.push(normalizedRoute);
  }

  return {
    router,
    routes: registeredRoutes
  };
}

function buildFullPath(basePath, path) {
  const normalizedBase = basePath === "/" ? "" : basePath.replace(/\/$/, "");
  const normalizedPath = path === "/" ? "" : path;
  return `${normalizedBase}${normalizedPath}` || "/";
}

module.exports = {
  defineRoute,
  createRegisteredRouter
};

// Made with Bob
