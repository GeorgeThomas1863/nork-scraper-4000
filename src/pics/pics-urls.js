import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

export const getNewPicURLs = async () => {
  const newPicArray = [];

  //get date array
  const dateArray = await getDateArray();
  const currentKcnaId = await getCurrentKcnaId();

  //loop 200 (400 lookups an hour)
  const startId = currentKcnaId - 100;
  const stopId = currentKcnaId + 100;

  let arrayIndex = 0;

  //loop
  for (let i = startId; i <= stopId; i++) {
    // console.log(i);
    for (let k = 0; k < dateArray.length; k++) {
      try {
        const dateString = dateArray[arrayIndex];
        const url = CONFIG.picBaseURL + dateString + "/PIC00" + i + ".jpg";
        console.log(url);

        //check if url new AND if pic (will throw error if not)
        await checkPicURL(url, CONFIG.picCollection);

        //otherwise store picURL
        const picParams = {
          url: url,
          kcnaId: i,
          dateString: dateString,
          picPath: CONFIG.savePicPathBase + i + ".jpg",
        };
        const storeModel = new dbModel(picParams, CONFIG.picCollection);
        await storeModel.storeUniqueURL();

        //STORE PIC HERE
        console.log(picParams);

        newPicArray.push(picParams);
      } catch (e) {
        console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
        arrayIndex++;
        if (arrayIndex > 2) arrayIndex = 0; //reset date array
      }
    }
  }
  return newPicArray;
};
