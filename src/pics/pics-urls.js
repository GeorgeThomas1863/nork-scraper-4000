import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";
import KCNA from "../../models/kcna-model.js";

import { getDateArray, getCurrentKcnaId } from "./pics-util.js";

/**
 * Re-Written get new pics checker, no better, just diff, properly iterates date array
 * @function getNewPicURLs
 * @returns uses MONGO to compare if any pics just downloaded are new, returns ARRAY of new pic OBJECTS
 */
export const getNewPicURLs = async () => {
  //define things
  const currentKcnaId = await getCurrentKcnaId();

  //SET WHERE to look here, loop 100? (200 lookups an hour) [DOUBLE CHECK in CONFIG]
  const startId = currentKcnaId - CONFIG.picsPerScrape;
  const stopId = currentKcnaId + CONFIG.picsPerScrape;
  const dateArray = await getDateArray();

  //run loop (return just for checking)
  const newPicArray = await runGetPicLoop(startId, stopId, dateArray);

  //return not needed just for tracking
  return newPicArray;
};

/**
 * Runs the actual loop to check for new pics (slightly less r slured)
 * @function runGetPicLoop
 * @param {*} startId - kcnaId to start loop
 * @param {*} stopId - kcnaId to stop loop
 * @returns array of new pic OBJECTS
 */
export const runGetPicLoop = async (startId, stopId, dateArray) => {
  const newPicArray = [];

  //loop
  let dateIndex = 0;
  for (let i = startId; i <= stopId; i++) {
    for (let k = 0; k < 3; k++) {
      try {
        const dateString = dateArray[dateIndex];
        const url = CONFIG.picBaseURL + dateString + "/PIC00" + i + ".jpg";
        console.log(url);

        //checks if new, and stores it, throws error if already have, null if doesnt exists
        const picObj = await buildPicObj(url, i, dateString);

        //iterate date array if doesnt exist (check again)
        if (!picObj) {
          dateIndex++;
          if (dateIndex > 2) dateIndex = 0;
          continue;
        }

        //if successful push to array for tracking
        newPicArray.push(picObj);
        break;
      } catch (e) {
        console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
        break;
      }
    }
  }

  //return unnecessary just for tracking
  return newPicArray;
};

/**
 * Builds AND stores the picObj
 * @function buildPicObj
 * @returns finished picObj
 */
export const buildPicObj = async (picURL, kcnaId, dateString) => {
  const urlObj = {
    url: picURL,
  };

  //check if pic new, throws error if not new
  const checkModel = new dbModel(urlObj, CONFIG.picCollection);
  await checkModel.urlNewCheck();

  //get pic Data
  const picModel = new KCNA(urlObj);
  const picObj = await picModel.getPicData();

  //return if getting pic data fails
  if (!picObj) return null;

  //otherwise add other things to picObj
  const returnObj = { ...picObj };
  returnObj.kcnaId = kcnaId;
  returnObj.dateString = dateString;
  returnObj.picPath = CONFIG.savePicPathBase + kcnaId + ".jpg";

  //store it, throws error if not new
  const storeModel = new dbModel(returnObj, CONFIG.picCollection);
  const storeTest = await storeModel.storeUniqueURL();
  console.log(storeTest);
  // console.log("PIC OBJECT");
  // console.log(returnObj);

  //if successful return RETURNOBJ (sad)
  return returnObj;
};
