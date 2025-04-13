import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { getDateArray, getCurrentKcnaId, checkHeader } from "./pics-util.js";

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
  const newPicArray = await runNewPicLoop(startId, stopId, dateArray);
  console.log("FINISHED GETTING FOLLOWING NEW PICS:");
  console.log(newPicArray);

  //USE mongo to check if any of the pics just downloaded (in loop) are NEW
  const checkParams = {
    collection1: CONFIG.picCollection, //list of pic URLs (just updated)
    collection2: CONFIG.downloadedCollection, //pics already downloaded
  };
  const checkModel = new dbModel(checkParams, "");
  const newPicURLs = await checkModel.findNewURLs();

  return newPicURLs;
};

/**
 * Runs the actual loop to check for new pics (slightly less r slured)
 * @function runNewPicLoop
 * @param {*} startId - kcnaId to start loop
 * @param {*} stopId - kcnaId to stop loop
 * @returns array of new pic OBJECTS
 */
export const runNewPicLoop = async (startId, stopId, dateArray) => {
  const newPicArray = [];

  //loop
  let dateIndex = 0;
  for (let i = startId; i <= stopId; i++) {
    for (let k = 0; k < 3; k++) {
      try {
        const dateString = dateArray[dateIndex];
        const url = CONFIG.picBaseURL + dateString + "/PIC00" + i + ".jpg";
        console.log(url);

        //throws error if already have pic, null if doesnt exist
        const newPic = await checkPicNew(url);

        //iterate date array if doesnt exist (check again)
        if (!newPic) {
          dateIndex++;
          if (dateIndex > 2) dateIndex = 0;
          continue;
        }

        //otherwise build picOBJ and store it here
        const picObj = await buildPicObj(url, i, dateString);
        console.log(picObj);
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
 * Checks whether url is already stored (throws error), AND if its a pic (returns null)
 * @function checkPicNew
 * @param {*} url - url to pic
 * @returns - if pic new returns pic headers, throws error if already stored, null if NOT pic
 */
export const checkPicNew = async (url) => {
  //check if new, will throw error if NOT new
  const checkModel = new dbModel({ url: url }, CONFIG.picCollection);
  await checkModel.urlNewCheck();

  //returns data type if pic, NULL if NOT pic
  const newPic = await checkHeader(url);
  return newPic;
};

/**
 * Builds AND stores the picObj (mostly unnecessary but whatever)
 * @function buildPicObj
 * @returns finished picObj
 */
export const buildPicObj = async (url, kcnaId, dateString) => {
  const picObj = {
    url: url,
    kcnaId: kcnaId,
    dateString: dateString,
    picPath: CONFIG.savePicPathBase + i + ".jpg",
  };

  //store it, throws error if not new
  const storeModel = new dbModel(picObj, CONFIG.picCollection);
  await storeModel.storeUniqueURL();

  //if successful return picObj
  return picObj;
};
