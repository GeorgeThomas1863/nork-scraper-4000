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
   * Function that sorts an array of article OBJECTS by DATE
   * @function sortArrayByDate
   * @param {} inputArray
   * @returns sorted Array of article OBJECTS (sorted by date oldest to newest)
   */
  async sortArrayByDate() {
    const inputArray = this.dataObject;
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

  /**
   * Gets the current article Id by looking in downloaded pics (or config if no pics yet downloaded)
   * @function getArticleId
   * @returns current article Id
   */
  async addArticleIdArray() {
    const inputArray = this.dataObject;
    if (!inputArray || !inputArray.length) return null;

    const currentArticleId = await this.getCurrentArticleId();

    const returnArray = [];
    for (let i = 0; i < inputArray.length; i++) {
      const inputObj = inputArray[i];
      const normalObj = { ...inputObj };

      //add in articleId
      normalObj.articleId = i + currentArticleId;

      // Add to the output array
      returnArray.push(normalObj);
    }

    return returnArray;
  }

  async getCurrentArticleId() {
    const dataModel = new dbModel({ keyToLookup: "articleId" }, CONFIG.articleDownloaded);
    const articleIdStored = await dataModel.findMaxId();

    //if doesnt exists
    if (!articleIdStored) return 0;

    //otherwise return stored value +1
    return articleIdStored + 1;
  }

  async getNewArray() {
    const dataType = this.dataObject.type;
    let checkParams = "";

    //prob convert to select case
    if (dataType === "articleDownload") {
      checkParams = {
        collection1: CONFIG.articleURLs, //list of article URLs (just updated)
        collection2: CONFIG.articleDownloaded, //list of articles content already downloaded
      };
    }

    const checkModel = new dbModel(checkParams, "");
    const newArray = await checkModel.findNewURLs();

    return newArray;
  }
}

export default UTIL;
