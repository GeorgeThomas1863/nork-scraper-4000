import { JSDOM } from "jsdom";

import UTIL from "./util-model.js";
import CONFIG from "../config/scrape-config.js";
import dbModel from "./db-model";

import { getArticleId, sortArticleArray } from "../src/articles/articles-util.js";

/**
 * @class Parse
 * @description Parses shit (mostly html)
 */
class Parse {
  /**
   * @constructor
   * @param {Object} dataObject - The data object with request parameters
   */
  constructor(dataObject) {
    this.dataObject = dataObject;
  }

  /**
   * Fetches HTML content from the specified URL (works for any url), returns as text
   * @function parseArticleList
   * @returns {array} ARRAY of sorted OBJECTs
   */
  async parseArticleList() {
    // Parse the HTML using JSDOM
    const dom = new JSDOM(this.dataObject.html);
    const document = dom.window.document;

    //define things
    const articleListArray = [];
    const urlConstant = "http://www.kcna.kp";

    // Find the element with class "article-link"
    const articleLinkElement = document.querySelector(".article-link");

    //if no article links (shouldnt happen)
    if (!articleLinkElement) return null;

    //HERE!!!!
    //CLAUDE CLAIMS I CAN REFACTOR THE BELOW AND PASS THE DOM ELEEMNT TO NEXT EQUATION. TEST THIS
    //!!!!!!

    // Find all anchor tags within the article-link element (puts them in an)
    const linkElements = articleLinkElement.querySelectorAll("a");

    //loop through a tags and pull out hrefs
    for (let i = 0; i < linkElements.length; i++) {
      const href = linkElements[i].getAttribute("href");
      const url = urlConstant + href; //build full url

      //GET DATE
      const dateElement = linkElements[i].querySelector(".publish-time");
      if (!dateElement) continue;
      const dateText = dateElement.textContent.trim();
      const articleDate = await this.parseDateElement(dateText);

      //build obj
      const listObj = {
        url: url,
        date: articleDate,
      };

      articleListArray.push(listObj); //add to array
    }

    const sortModel = new UTIL({ inputArray: articleListArray });
    const articleListNormal = await sortModel.sortArticleArray();

    const storeModel = new UTIL({ data: articleListNormal, collection: CONFIG.articleURLs });
    const storeData = await storeModel.storeArray();
    console.log(storeData);

    //noramlize article list
    return articleListArray;
  }

  //breaks out date parsing
  async parseDateElement(dateText) {
    //return null if empty
    if (!dateText) return null;

    const dateRaw = dateText.replace(/[\[\]]/g, "");

    // Convert the date string (YYYY.MM.DD) to a JavaScript Date object, then split to arr
    const dateArr = dateRaw.split(".");
    const year = parseInt(dateArr[0]);
    // JS months are 0-based (subtract 1 at end)
    const month = parseInt(dateArr[1]);
    const day = parseInt(dateArr[2]);

    // Validate the date; if fucked return null
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const articleDate = new Date(year, month - 1, day);
    return articleDate;
  }
}

export default Parse;
