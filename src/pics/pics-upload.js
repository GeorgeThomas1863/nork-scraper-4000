import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { uploadPicsTG } from "../tg-api.js";

/**
 * Uploads SINGLE pic to tg
 * @function postPicFS
 * @param {Object} picObj
 * @param picObj.url URL to pic (to check if new)
 * @param picObj.chatId TG channel to post to
 * @param picObj.picPath save path of pic
 */
export const postPicFS = async (picObj) => {
  try {
    //check if pic new / NOT already uploaded
    const picModel = new dbModel(picObj, CONFIG.uploadedCollection);
    await picModel.urlNewCheck(); //will throw error if already posted

    //otherwise post pic (use TG api for token check)
    const uploadData = await uploadPicsTG(picObj);
    return uploadData;
  } catch (e) {
    console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
  }
};
