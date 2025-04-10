import CONFIG from "../../config/scrape-config.js";

import dbModel from "../../models/db-model.js";
import KCNA from "../../models/kcna-model.js";

export const getNewPicURLs = async () => {
  const newPicArray = [];

  //get date array
  const dateArray = await getDateArray();
  const currentKcnaId = await getCurrentKcnaId();

  //loop 200 (400 lookups an hour)
  const startId = currentKcnaId - 100;
  const stopId = currentKcnaId + 100;

  let arrayIndex = 0;

  //loop
  for (let i = startId; i <= stopId; i++) {
    // console.log(i);
    for (let k = 0; k < dateArray.length; k++) {
      try {
        const dateString = dateArray[arrayIndex];
        const url = CONFIG.picBaseURL + dateString + "/PIC00" + i + ".jpg";
        console.log(url);

        //check if url new AND if pic (will throw error if not)
        await checkPicURL(url);

        //otherwise store picURL
        const picParams = {
          url: url,
          kcnaId: i,
          dateString: dateString,
          picPath: CONFIG.savePicPathBase + i + ".jpg",
        };
        const storeModel = new dbModel(picParams, CONFIG.picCollection);
        await storeModel.storeUniqueURL();

        //STORE PIC HERE
        console.log(picParams);

        newPicArray.push(picParams);
      } catch (e) {
        console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
        arrayIndex++;
        if (arrayIndex > 2) arrayIndex = 0; //reset date array
      }
    }
  }
  return newPicArray;
};

/**
 * checks if url new AND if its a pic
 * @function checkPicURL
 * @param url (url to be checked)
 * @returns true if new / exists, throws error if not
 */

export const checkPicURL = async (url) => {
  //check if already have url BEFORE http req
  const checkModel = new dbModel({ url: url }, CONFIG.picCollection);
  await checkModel.urlNewCheck(); //will throw error if not new

  //http req
  const kcnaModel = new KCNA({ url: url });
  const dataType = await kcnaModel.getDataType();

  //if not pic throw error
  if (dataType !== "image/jpeg") {
    const error = new Error("URL NOT A PIC");
    error.url = url;
    error.function = "checkPicURL";
    throw error;
  }

  //othewise return true
  return true;
};

/**
 * Builds an array of date strings (YYYYMM) for current month / year and adjacent months (needed for kcna url format)
 * @function getDateArray
 * @returns {Promise<Array<string>>} Array of date strings (current month and one month before/after)
 */
const getDateArray = async () => {
  const currentDate = new Date();
  const dateArray = [];

  for (let i = -1; i < 2; i++) {
    const date = new Date(currentDate);
    const currentMonth = date.getMonth();
    //plus 1 needed bc month 0 indexed
    const monthRaw = currentMonth + i + 1;

    // Pad month with leading zero if needed
    const month = monthRaw.toString().padStart(2, "0");

    // Get full year
    const year = date.getFullYear();

    // Add month+year string to result array
    dateArray.push(year + "" + month);
  }

  return dateArray;
};

/**
 * Calculates the current startId for where to look for new pics (returns MAX kcnaId)
 * if no kcnaId exists returns config start (for first scrape)
 * @function getCurrentKcnaId
 * @returns {Promise<number>} Maximum of either kcnaId value or CONFIG.currentId setting (for startId)
 */
const getCurrentKcnaId = async () => {
  const dataModel = new dbModel({ keyToLookup: "kcnaId" }, CONFIG.picCollection);
  const maxId = await dataModel.findMaxId();

  //no id on first lookup
  if (!maxId || CONFIG.currentId > maxId) return CONFIG.currentId;

  //otherwise calculate it
  return maxId;
};
