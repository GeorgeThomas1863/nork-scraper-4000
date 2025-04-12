import CONFIG from "../../config/scrape-config.js";

import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

/**
 * Finds new pics to be downloaded, passes as array of OBJs for downloading
 * @function downloadNewPics
 * @returns number downloaded(array length)
 */
export const downloadNewPics = async () => {
  //get pics that havent been downloaded (are new)
  const newPicParams = {
    collection1: CONFIG.picCollection, //old thing, to compare against
    collection2: CONFIG.downloadedCollection, //new thing, what this funct is doing
  };
  const downloadModel = new dbModel(newPicParams, "");
  const downloadArray = await downloadModel.findNewURLs();

  const runDownloadPicsFS = await downloadPicArray(downloadArray);
  // console.log(runDownloadPicsFS);
  return runDownloadPicsFS;
};

/**
 * Download pics array
 * @function downloadPicsFS
 * @params picArray - Array of pic OBJECTS to download
 * @returns items downloaded
 */
export const downloadPicArray = async (picArray) => {
  if (!picArray) return null;

  const picDownloadedArray = [];
  for (let i = 0; i < picArray.length; i++) {
    try {
      const picObj = picArray[i];
      await downloadPicFS(picObj); //throws error if failed

      //store pic downloaded
      picDownloadedArray.push(picObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  return picDownloadedArray;
};

/**
 * Downloads SINGLE pic from picOBJ
 * @param {*} picObj OBJECT with pic url / picPath
 * @returns picData
 */
export const downloadPicFS = async (picObj) => {
  //first check if pic NOT already downloaded
  const picModel = new dbModel(picObj, CONFIG.downloadedCollection);
  await picModel.urlNewCheck(); //throws error if pic already downloaded

  //build params
  const picParams = {
    url: picObj.url,
    savePath: picObj.picPath,
  };

  //download Pic
  const downloadModel = new KCNA(picParams);
  const picData = await downloadModel.downloadPicFS();

  //throw error if failed
  if (!picData) {
    const error = new Error("PIC DOWNLOAD FUCKED");
    error.url = picObj.url;
    error.function = "downloadPicFS";
    throw error;
  }

  //store picObj
  const storeObj = await picModel.storeUniqueURL();
  console.log(storeObj);

  //return data from download
  return picData;
};
