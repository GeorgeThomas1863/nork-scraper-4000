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

  const runDownloadPicsFS = await downloadPicsFS(downloadArray);
  // console.log(runDownloadPicsFS);
  return runDownloadPicsFS;
};

/**
 * Download pics array
 * @function downloadPicsFS
 * @returns number of new pics (length of newPicURLs array)
 */
export const downloadPicsFS = async (picArray) => {
  //array of pic OBJs downloaded for tracking
  const picDownloadedArray = [];
  for (let i = 0; i < picArray.length; i++) {
    try {
      const pic = picArray[i];
      //check if pic has been downloaded (mostly unnecessary)
      const storePicModel = new dbModel(pic, CONFIG.downloadedCollection);
      await storePicModel.urlNewCheck(); //throws error if pic already downloaded
      //otherwise build params to download
      const downloadPicParams = {
        url: pic.url,
        savePath: pic.picPath,
      };
      console.log(downloadPicParams);
      //download pic
      const downloadPicModel = new KCNA(downloadPicParams);
      const downloadPicData = await downloadPicModel.downloadPicFS();
      // console.log(downloadPicData);
      //store pic was downloaded
      const storePicDownloaded = await storePicModel.storeUniqueURL();
      console.log(storePicDownloaded);

      //once done add to array for tracking
      picDownloadedArray.push(pic);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  return picDownloadedArray.length;
};
