/**
 * Neon Database Connection
 * Serverless PostgreSQL with connection pooling
 */

import { neon, neonConfig } from '@neon-db/serverless';
import { config } from 'dotenv';

config();

// Configure for edge/serverless environments
neonConfig.fetchConnectionCache = true;

// Get connection string from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
}

// Create SQL client
export const sql = neon(DATABASE_URL);

// Helper function to execute queries with error handling
export async function query<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as time, version() as version`;
    console.log('✅ Database connected:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (sql: typeof query) => Promise<T>
): Promise<T> {
  // Neon doesn't support traditional transactions in HTTP mode
  // Use application-level error handling
  try {
    return await callback(query);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
