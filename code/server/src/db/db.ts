"use strict";

/**
 * Example of a database connection if using SQLite3.
 */

import { Database } from "sqlite3";

import sqlite from "sqlite3";

// The environment variable is used to determine which database to use.
// If the environment variable is not set, the development database is used.
// A separate database needs to be used for testing to avoid corrupting the development database and ensuring a clean state for each test.

//The environment variable is set in the package.json file in the test script.
/* istanbul ignore next */
const env = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : "development";

// The database file path is determined based on the environment variable.
/* istanbul ignore next */
const dbFilePath = env === "test" ? "./src/db/testdb.db" : "./src/db/db.db";

// The database is created and the foreign keys are enabled.
/* istanbul ignore next */
const db: Database = new sqlite.Database(dbFilePath, (err: Error | null) => {
    if (err) throw err;
    db.run("PRAGMA foreign_keys = ON");
});

export default db;
