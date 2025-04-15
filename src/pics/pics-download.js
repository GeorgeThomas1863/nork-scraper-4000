import CONFIG from "../../config/scrape-config.js";

import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

/**
 * Download pics array
 * @function downloadPicArray
 * @params picArray - Array of pic OBJECTS to download
 * @returns items downloaded
 */
export const downloadPicArray = async (picArray) => {
  if (!picArray || !picArray.length) return null;

  //loop through array
  const picDownloadedArray = [];
  for (let i = 0; i < picArray.length; i++) {
    try {
      const picObj = picArray[i];

      //throws error if already downloaded / on fail
      const downloadObj = await downloadNewPic(picObj);

      //if successful, track pic downloaded
      picDownloadedArray.push(downloadObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  //just for tracking
  return picDownloadedArray;
};

/**
 * Downloads single pic, after checking if new, stores if successful
 * @function downloadNewPic
 * @param {*} picObj - picObj to download
 * @returns input param if downloaded, throws error if pic already downloaded / on fail
 */
export const downloadNewPic = async (picObj) => {
  if (!picObj) return null;

  //first check if pic NOT already downloaded
  const dataModel = new dbModel(picObj, CONFIG.downloadedCollection);
  await dataModel.urlNewCheck(); //throws error if pic already downloaded

  //download pic, (throws error on fail)
  const picModel = new KCNA(picObj);
  await picModel.downloadPicFS();

  //if successful store pic
  const storeData = await dataModel.storeUniqueURL();
  console.log(storeData);

  //return just for tracking
  return picObj;
};
