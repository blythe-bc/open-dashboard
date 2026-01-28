const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('/home/user/.gemini/tmp/80d3bec0670d13b276225fdd26d51791b5ca65bc1cd0766dfefa1202b469cf17/dev.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the development database.');
});

db.serialize(() => {
    try {
        db.run(`ALTER TABLE WorkspacePolicy ADD COLUMN llmEnabled INTEGER DEFAULT 0`, (err) => {
            if (err && err.message.includes('duplicate column name')) {
                console.log('Column llmEnabled already exists.');
            } else if (err) {
                console.error('Error adding column:', err.message);
            } else {
                console.log('Added llmEnabled to WorkspacePolicy.');
            }
        });
    } catch (e) {
        console.log(e);
    }
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});
