import { PrismaClient } from "@prisma/client";

/**
 * Shared, guarded PrismaClient.
 *
 * If DATABASE_URL is missing or invalid, constructing PrismaClient can throw
 * at module load — which previously crashed the whole server (and produced a
 * plain-text HTML error that broke the frontend's JSON parsing). This module
 * guards against that so the server can still boot and return a clear JSON
 * error from the routes that need the database.
 *
 * All route files and server.js should import Prisma from here so there is a
 * single instance and a single guard.
 */
let prisma;

try {
  prisma = new PrismaClient();
} catch (e) {
  console.error("Failed to initialize PrismaClient:", e?.message || e);
  prisma = null;
}

export default prisma;
