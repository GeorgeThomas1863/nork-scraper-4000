import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { getDateArray, getCurrentKcnaId, checkPicURL } from "./pics-util.js";

/**
 * Re-Written get new pics checker, prob no better, just diff
 * so can properly iterate date array
 * @function getNewPicURLs
 * @returns array of new pic OBJs
 */
export const getNewPicURLs = async () => {
  const newPicArray = [];

  //define things
  const currentKcnaId = await getCurrentKcnaId();
  const dateArray = await getDateArray();

  //loop 200 (400 lookups an hour)
  const startId = currentKcnaId - 100;
  const stopId = currentKcnaId + 100;

  //loop
  let arrayIndex = 0;
  for (let i = startId; i <= stopId; i++) {
    // console.log(i);
    for (let k = 0; k < 3; k++) {
      const dateString = dateArray[arrayIndex];
      const url = CONFIG.picBaseURL + dateString + "/PIC00" + i + ".jpg";

      //check if pic new, iterate date if not
      const newPic = await isNewPic(url);
      if (!newPic) {
        arrayIndex++;
        if (arrayIndex > 2) arrayIndex = 0;
        continue;
      }

      //build obj and store it
      const picObj = {
        url: url,
        kcnaId: i,
        dateString: dateString,
        picPath: CONFIG.savePicPathBase + i + ".jpg",
      };

      //should all be unique so no try catch
      const storeModel = new dbModel(picObj, CONFIG.picCollection);
      await storeModel.storeUniqueURL();
      console.log(picObj);

      newPicArray.push(picObj);
    }
  }
  return newPicArray;
};

/**
 * Dumb function that catches the error i'm throwing when shit isnt new,
 * so can properly iterate date array
 * @function isNewPic
 * @param {*} url (url being checked)
 * @returns pic data if true, null if error
 */
export const isNewPic = async (url) => {
  try {
    const newPic = await checkPicURL(url, CONFIG.picCollection);
    return newPic;
  } catch (e) {
    console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
  }
};
