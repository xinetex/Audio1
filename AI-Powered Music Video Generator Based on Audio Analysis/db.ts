import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  InsertProject, 
  Project,
  musicAnalysis,
  InsertMusicAnalysis,
  MusicAnalysis,
  videoSegments,
  InsertVideoSegment,
  VideoSegment,
  finalVideos,
  InsertFinalVideo,
  FinalVideo
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Project management functions
export async function createProject(project: InsertProject): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(project);
  const insertedId = Number(result[0].insertId);
  
  const newProject = await db.select().from(projects).where(eq(projects.id, insertedId)).limit(1);
  return newProject[0];
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(projects).where(eq(projects.userId, userId));
}

export async function updateProject(id: number, updates: Partial<InsertProject>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects).set(updates).where(eq(projects.id, id));
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related records first
  await db.delete(musicAnalysis).where(eq(musicAnalysis.projectId, id));
  await db.delete(videoSegments).where(eq(videoSegments.projectId, id));
  await db.delete(finalVideos).where(eq(finalVideos.projectId, id));
  
  // Delete project
  await db.delete(projects).where(eq(projects.id, id));
}

// Music analysis functions
export async function saveMusicAnalysis(analysis: InsertMusicAnalysis): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(musicAnalysis).values(analysis).onDuplicateKeyUpdate({
    set: analysis,
  });
}

export async function getMusicAnalysis(projectId: number): Promise<MusicAnalysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(musicAnalysis).where(eq(musicAnalysis.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Video segment functions
export async function createVideoSegment(segment: InsertVideoSegment): Promise<VideoSegment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(videoSegments).values(segment);
  const insertedId = Number(result[0].insertId);
  
  const newSegment = await db.select().from(videoSegments).where(eq(videoSegments.id, insertedId)).limit(1);
  return newSegment[0];
}

export async function getProjectVideoSegments(projectId: number): Promise<VideoSegment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(videoSegments).where(eq(videoSegments.projectId, projectId));
}

export async function updateVideoSegment(id: number, updates: Partial<InsertVideoSegment>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(videoSegments).set(updates).where(eq(videoSegments.id, id));
}

// Final video functions
export async function saveFinalVideo(video: InsertFinalVideo): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(finalVideos).values(video).onDuplicateKeyUpdate({
    set: video,
  });
}

export async function getFinalVideo(projectId: number): Promise<FinalVideo | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(finalVideos).where(eq(finalVideos.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
