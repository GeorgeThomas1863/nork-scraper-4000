import dbModel from "../../models/db-model.js";

/**
 * Stores a list of UNIQUE article URLs in the database
 * @function storeArticleList
 * @param {Array} inputArray - Array of objects containing article URLs
 * @returns {Promise<boolean>} True if storage was successful
 */
export const storeArticleArray = async (inputArray, collection) => {
  if (!inputArray) return null;

  for (let i = 0; i < inputArray.length; i++) {
    const storeObj = inputArray[i];
    try {
      const storeModel = new dbModel(storeObj, collection);
      await storeModel.storeUniqueURL();
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
    // console.log(storeURL);
  }
  return "FINISHED STORING ARTICLE ARRAY";
};
