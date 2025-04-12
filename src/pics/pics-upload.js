import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { uploadPicsTG, editCaptionTG } from "../tg-api.js";

/**
 * Uploads SINGLE pic to tg
 * @function postPicFS
 * @param {Object} picObj
 * @param picObj.url URL to pic (to check if new)
 * @param picObj.chatId TG channel to post to
 * @param picObj.picPath save path of pic
 * @param picObj.kcnaId kcna Id for pic
 */
export const postPicFS = async (picObj) => {
  if (!picObj || !picObj.url) return null;

  try {
    //check if pic new / NOT already uploaded
    const picModel = new dbModel(picObj, CONFIG.uploadedCollection);
    await picModel.urlNewCheck(); //will throw error if already posted

    //otherwise post pic (use TG api for token check)
    const uploadPicData = await uploadPicsTG(picObj);

    console.log("HERE FUCKHEAD CAPTION");
    console.log(uploadPicData);

    //build caption
    const defangURL = picObj.url.replace(/\./g, "[.]").replace(/:/g, "[:]");
    const normalURL = defangURL.substring(15);
    const caption = "ID: " + picObj.kcnaId + "; URL: " + normalURL;

    //edit caption
    await editCaptionTG(uploadPicData, caption);

    //store pic was uploaded
    const storePicUploaded = await picModel.storeUniqueURL();
    console.log(storePicUploaded);

    //edit caption
    return uploadPicData;
  } catch (e) {
    console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
  }
};
