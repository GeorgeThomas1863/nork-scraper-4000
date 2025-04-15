import CONFIG from "../../config/scrape-config.js";

import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

//IDENTIFY NEW PICS BY FUCKING PIC SIZE
export const downloadNewPics = async () => {
  //USE mongo to check if any of the pics just downloaded (in loop) are NEW
  //COMPARES BASED ON PIC SIZE
  const checkParams = {
    collection1: CONFIG.picCollection, //list of pic URLs (just updated)
    collection2: CONFIG.downloadedCollection, //pics already downloaded
  };
  const checkModel = new dbModel(checkParams, "");
  const newPicURLs = await checkModel.findNewPicsBySize();

  const picsDownloaded = await downloadPicArray(newPicURLs);
  return picsDownloaded;
};

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
      const downloadObj = await downloadPic(picObj);

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
 * @function downloadPic
 * @param {*} picObj - picObj to download
 * @returns input param if downloaded, throws error if pic already downloaded / on fail
 */
export const downloadPic = async (picObj) => {
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
