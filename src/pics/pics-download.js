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
      await downloadNewPic(picObj); //throws error if failed

      //if successful, track pic downloaded
      picDownloadedArray.push(picObj);
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
  const picModel = new dbModel(picObj, CONFIG.downloadedCollection);
  await picModel.urlNewCheck(); //throws error if pic already downloaded

  //if new download
  const picData = await downloadPicFS(picObj);

  //throw error if pic download failed
  if (!picData) {
    const error = new Error("PIC DOWNLOAD FUCKED");
    error.url = picObj.url;
    error.function = "downloadNewPic";
    throw error;
  }

  //otherwise, store picObj as downloaded
  const storeObj = await picModel.storeUniqueURL();
  console.log(storeObj);
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
  const picData = await downloadModel.downloadPicFS();

  //return data from download
  return picData;
};
