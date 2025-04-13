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
      console.log(picObj);
      const downloadObj = await downloadNewPic(picObj); //throws error if failed

      //if successful, track pic downloaded
      picDownloadedArray.push(downloadObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  return picDownloadedArray;
};

/**
 * Checks if pic is New, downloads it if it is, then stores it if successful
 * @param {*} picObj - picObj to download
 */
export const downloadNewPic = async (picObj) => {
  if (!picObj) return null;

  //first check if pic NOT already downloaded
  const checkModel = new dbModel(picObj, CONFIG.downloadedCollection);
  await checkModel.urlNewCheck(); //throws error if pic already downloaded

  const downloadObj = { ...picObj };

  //if new download
  const picSize = await downloadPicFS(downloadObj);

  //throw error if pic download failed
  if (!picSize) {
    const error = new Error("PIC DOWNLOAD FUCKED");
    error.url = picObj.url;
    error.function = "downloadNewPic";
    throw error;
  }

  //add size to obj
  downloadObj.picSize = picSize;

  //store it
  const storeModel = new dbModel(downloadObj, CONFIG.downloadedCollection);
  const storeData = await storeModel.storeUniqueURL();
  console.log(storeData);

  return downloadObj;
};

/**
 * Downloads SINGLE pic from picOBJ
 * @function downloadPicFS
 * @param {*} picObj OBJECT with pic url / picPath
 * @returns picData
 */
export const downloadPicFS = async (picObj) => {
  //build params
  const picParams = {
    url: picObj.url,
    savePath: picObj.picPath,
  };

  //download Pic
  const downloadModel = new KCNA(picParams);
  const picSize = await downloadModel.downloadPicFS();

  //return data from download
  return picSize;
};
