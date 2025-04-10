import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { getDateArray, getCurrentKcnaId, checkHeader } from "./pics-util.js";

/**
 * Re-Written get new pics checker,  no better, just diff
 * so can properly iterate date array
 * @function getNewPicURLs
 * @returns array of new pic OBJs
 */
export const getNewPicURLs = async () => {
  const newPicArray = [];

  //define things
  const currentKcnaId = await getCurrentKcnaId();
  const dateArray = await getDateArray();

  //loop 200 (400 lookups an hour) [DOUBLE CHECK in CONFIG]
  const startId = currentKcnaId - CONFIG.picsPerScrape;
  const stopId = currentKcnaId + CONFIG.picsPerScrape;

  //loop
  let arrayIndex = 0;
  for (let i = startId; i <= stopId; i++) {
    for (let k = 0; k < 3; k++) {
      try {
        console.log("ARRAY INDEX");
        console.log(arrayIndex);
        const dateString = dateArray[arrayIndex];
        const url = CONFIG.picBaseURL + dateString + "/PIC00" + i + ".jpg";
        console.log(url);

        //check if newe
        const checkModel = new dbModel({ url: url }, CONFIG.picCollection);
        await checkModel.urlNewCheck(); //will throw error if not new
        const newPic = await checkHeader(url);

        //NOT PIC iterate date array
        if (!newPic) {
          arrayIndex++;
          if (arrayIndex > 2) arrayIndex = 0;
          continue;
        }

        //otherwise build obj and store it
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
        break;
      } catch (e) {
        console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
        break;
      }
    }
  }
  return newPicArray;
};
