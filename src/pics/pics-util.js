import CONFIG from "../../config/scrape-config.js";

import dbModel from "../../models/db-model.js";
import KCNA from "../../models/kcna-model.js";

/**
 * checks picURL header for no reason
 * @function checkHeader
 * @param url (url to be checked)
 * @returns true if new / exists, throws error if not
 */
//FUCKING USELESS
export const checkHeader = async (inputURL) => {
  //http req
  const kcnaModel = new KCNA({ url: inputURL });
  const dataType = await kcnaModel.getPicData();
  console.log("DATA TYPE");
  console.log(dataType);

  //if pic return data
  if (dataType === "image/jpeg") return dataType;

  //othewise return null
  return null;
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
