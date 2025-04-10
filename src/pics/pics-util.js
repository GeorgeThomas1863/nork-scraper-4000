import CONFIG from "../../config/scrape-config.js";

import dbModel from "../../models/db-model.js";
import KCNA from "../../models/kcna-model.js";

/**
 * checks if url new AND if its a pic
 * @function checkPicURL
 * @param url (url to be checked)
 * @returns true if new / exists, throws error if not
 */

export const checkPicURL = async (url, collection) => {
  //check if already have url BEFORE http req
  const checkModel = new dbModel({ url: url }, collection);
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
export const getDateArray = async () => {
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
export const getCurrentKcnaId = async () => {
  const dataModel = new dbModel({ keyToLookup: "kcnaId" }, CONFIG.picCollection);
  const maxId = await dataModel.findMaxId();

  //no id on first lookup
  if (!maxId || CONFIG.currentId > maxId) return CONFIG.currentId;

  //otherwise calculate it
  return maxId;
};
