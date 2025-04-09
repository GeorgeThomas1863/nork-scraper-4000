import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

/**
 * Stores a list of article URLs in the database
 * @function storeArticleList
 * @param {Array} inputArray - Array of objects containing article URLs
 * @returns {Promise<boolean>} True if storage was successful
 */
export const storeArticleListArray = async (inputArray) => {
  for (let i = 0; i < inputArray.length; i++) {
    try {
      const urlObj = {
        url: inputArray[i],
      };
      const storeModel = new dbModel(urlObj, CONFIG.articleListCollection);
      await storeModel.storeUniqueURL();
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
    // console.log(storeURL);
  }
  return "FINISHED STORING ARTICLE LIST";
};
