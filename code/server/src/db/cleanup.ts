"use strict";

import db from "../db/db";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */
export async function cleanup() {
    db.run("DELETE FROM users");
    db.run("DELETE FROM carts");
    db.run("DELETE FROM products");
    db.run("DELETE FROM reviews");
    db.run("DELETE FROM products_in_cart");
}
