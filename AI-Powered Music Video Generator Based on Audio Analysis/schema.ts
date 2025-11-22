import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Music video projects table
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  audioFileKey: varchar("audioFileKey", { length: 512 }),
  audioFileUrl: text("audioFileUrl"),
  audioFileName: varchar("audioFileName", { length: 255 }),
  audioFileDuration: float("audioFileDuration"),
  status: mysqlEnum("status", ["pending", "analyzing", "generating", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Music analysis results table
 */
export const musicAnalysis = mysqlTable("musicAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  tempo: float("tempo"),
  musicalKey: varchar("musicalKey", { length: 20 }),
  energy: float("energy"),
  mood: varchar("mood", { length: 50 }),
  structure: json("structure").$type<Array<{
    type: string;
    startTime: number;
    endTime: number;
  }>>(),
  beats: json("beats").$type<number[]>(),
  spectralFeatures: json("spectralFeatures").$type<{
    brightness: number;
    timbre: number;
    contrast: number[];
  }>(),
  analysisData: json("analysisData").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MusicAnalysis = typeof musicAnalysis.$inferSelect;
export type InsertMusicAnalysis = typeof musicAnalysis.$inferInsert;

/**
 * Video generation segments table
 */
export const videoSegments = mysqlTable("videoSegments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  segmentIndex: int("segmentIndex").notNull(),
  prompt: text("prompt").notNull(),
  startTime: float("startTime").notNull(),
  endTime: float("endTime").notNull(),
  videoFileKey: varchar("videoFileKey", { length: 512 }),
  videoFileUrl: text("videoFileUrl"),
  replicateId: varchar("replicateId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type VideoSegment = typeof videoSegments.$inferSelect;
export type InsertVideoSegment = typeof videoSegments.$inferInsert;

/**
 * Final assembled videos table
 */
export const finalVideos = mysqlTable("finalVideos", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  videoFileKey: varchar("videoFileKey", { length: 512 }).notNull(),
  videoFileUrl: text("videoFileUrl").notNull(),
  duration: float("duration").notNull(),
  resolution: varchar("resolution", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinalVideo = typeof finalVideos.$inferSelect;
export type InsertFinalVideo = typeof finalVideos.$inferInsert;
