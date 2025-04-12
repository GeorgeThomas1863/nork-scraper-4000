import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { uploadPicsTG, editCaptionTG } from "../tg-api.js";

/**
 * Uploads SINGLE pic to tg (needs try catch)
 * @function postPicFS
 * @param {Object} picObj
 * @param picObj.url URL to pic (to check if new)
 * @param picObj.chatId TG channel to post to
 * @param picObj.picPath save path of pic
 * @param picObj.kcnaId kcna Id for pic
 */
export const postPicFS = async (picObj) => {
  if (!picObj || !picObj.url) return null;

  //check if pic new / NOT already uploaded
  const picModel = new dbModel(picObj, CONFIG.uploadedCollection);
  await picModel.urlNewCheck(); //will throw error if already posted

  //otherwise post pic (use TG api for token check)
  const uploadPicData = await uploadPicsTG(picObj);

  //build caption
  const defangURL = picObj.url.replace(/\./g, "[.]").replace(/:/g, "[:]");
  const normalURL = defangURL.substring(15);
  const caption = "ID: " + picObj.kcnaId + "; URL: " + normalURL;

  //edit caption
  await editCaptionTG(uploadPicData, caption);

  //store uploaded
  await picModel.storeUniqueURL();

  //edit caption
  return uploadPicData;
};
