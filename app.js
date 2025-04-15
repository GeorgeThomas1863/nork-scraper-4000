//TO DO

//UNFUCK PIC DOWNLOADING
//MAKE SURE ARTICLE PICS ARENT IDENTIFYING / SAVING ALREADY KNOWN PICS
//MAYBE JUST MAYBE TRY TO MAKE SOME PROGRESS

// ADD CURRENT DATE time as "scrapeDate" to picOBJ
// USE pic size to compare if new (the point of all this)

// //FINISH PIC UPLOADING (ADD EDIT CAPTIONS, etc)

//(DO LATER) Make a separate branch using puppeteer to pull pics (will let you get more info from server)

//TEST DOWNLOAD PICS WORKS
//BUILD UPLOAD TO TG, MAKE IT COMBO BY DEFAULT

//BUILD API interface

/**
 * @fileoverview Main application entry point for the KCNA scraping service
 * @module app
 *
 * Initializes Express server, connects to MongoDB, and sets up routes.
 * Configures view engine, middleware, and static file serving.
 */

import { dirname, join } from "path";
import { fileURLToPath } from "url";

import express from "express";
// import session from "express-session";

import CONFIG from "./config/scrape-config.js";
import routes from "./routes/router.js";
import * as db from "./data/db.js";

//TEST, DELETE later
import { runAutoScrape } from "./src/srape.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// app.set("views", join(__dirname, "html"));
// app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

/**
 * Configure / set custom express static path for pictures on file system
 * (simplifies uploading / downloading pics)
 */
// app.use(CONFIG.expressPicPath, express.static(CONFIG.savePicPathBase));
app.use(routes);

runAutoScrape();

/**
 * Connect to database and start the server if db works
 * @listens {number} CONFIG.port - Port number from configuration
 */
db.dbConnect().then(() => {
  //port to listen
  // app.listen(CONFIG.port);
  // app.listen(1950);
});
