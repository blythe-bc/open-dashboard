import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function openDb() {
    // Check if SQLITE_DB_PATH is set, otherwise fall back to a default (or throw error)
    const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'dev.db');

    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}