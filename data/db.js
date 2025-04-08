/**
 * @fileoverview MongoDB database connection configuration
 * @module data/db
 */

import { MongoClient } from "mongodb";
import CONFIG from "../config/scrape-config.js";

/**
 * Database connection instance
 * @type {import('mongodb').Db|undefined}
 * @private
 */
let db;

/**
 * dbConnect: Establishes connection to MongoDB server
 *
 * @async
 * @function dbConnect
 * @returns {Promise<void>} Promise that resolves when connection is established
 * @throws {Error} If connection to MongoDB fails
 */
export const dbConnect = async () => {
  //connect to mongo server
  const client = await MongoClient.connect("mongodb://localhost:27017");
  db = client.db(CONFIG.dbName);
};

//create function to call database outside file
export const dbGet = () => {
  //ensure db connection is working
  if (!db) {
    throw { message: "Database connection fucked" };
  }
  return db;
};
