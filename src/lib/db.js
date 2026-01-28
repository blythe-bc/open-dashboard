import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
    return open({
        filename: '/home/user/.gemini/tmp/80d3bec0670d13b276225fdd26d51791b5ca65bc1cd0766dfefa1202b469cf17/dev.db',
        driver: sqlite3.Database
    });
}
