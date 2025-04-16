import CONFIG from "../config/scrape-config.js";
import dbModel from "./db-model.js";

/**
 * @class UTIL
 * @description does utility shit
 */
class UTIL {
  /**
   * @constructor
   * @param {Object} dataObject - The data object with request parameters
   */
  constructor(dataObject) {
    this.dataObject = dataObject;
  }

  /**
   * Loops through array of article OBJECTs to store them (or any array)
   * @function storeArray (billionth time we created this before deleting it again)
   * @params obj with one key data to store, other collection
   * @returns array of stored data (for tracking)
   */
  async storeArray() {
    const storeArray = [];

    try {
      const storeModel = new dbModel(this.dataObject.data, this.dataObject.collection);
      const storeData = await storeModel.storeUniqueURL();
      storeArray.push(storeData);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }

    //for tracking
    return storeArray;
  }

  /**
   * Sorts an ARRAY, ADDs article ID
   * @function sortArticleList
   * @returns {array} ARRAY of sorted OBJECTs
   */

  async sortArticleArray() {
    //return null on blank input
    const inputArray = this.dataObject.inputArray;
    if (!inputArray || !inputArray.length) return null;

    //get the current article id, returns 0 if doesnt exist
    const arrayNormal = [];
    const currentArticleId = await this.getArticleId();

    const sortArray = await this.sortArrayByDate(inputArray);

    // loop through input array (of OBJs) adding articleId identifier
    for (let i = 0; i < sortArray.length; i++) {
      const inputObj = sortArray[i];
      const normalObj = { ...inputObj };

      //add in articleId
      normalObj.articleId = i + currentArticleId;

      // Add to the output array
      arrayNormal.push(normalObj);
    }

    //just for tracking, not necessary
    return arrayNormal;
  }

  /**
   * Gets the current article Id by looking in downloaded pics (or config if no pics yet downloaded)\
   * @function getArticleId
   * @returns current article Id
   */
  async getArticleId() {
    const dataModel = new dbModel({ keyToLookup: "articleId" }, CONFIG.articleDownloaded);
    const articleIdStored = await dataModel.findMaxId();

    //if doesnt exists
    if (!articleIdStored) return 0;

    //otherwise return stored value +1
    return articleIdStored + 1;
  }

  /**
   * Function that sorts an array of article OBJECTS by DATE
   * @function sortArrayByDate
   * @param {} inputArray
   * @returns sorted Array of article OBJECTS (sorted by date oldest to newest)
   */
  async sortArrayByDate(inputArray) {
    //return null on blank input
    if (!inputArray || !inputArray.length) return null;

    // Create a copy of the array to avoid modifying the original
    const sortArray = [...inputArray];

    //sort input array by DATE OLDEST to NEWEST
    sortArray.sort((a, b) => {
      // Convert datetime strings to Date objects if needed
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateA - dateB;
    });

    return sortArray;
  }
}

export default UTIL;
