import { JSDOM } from "jsdom";

import UTIL from "./util-model.js";
import CONFIG from "../config/scrape-config.js";

import dbModel from "./db-model.js";

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
    const dom = new JSDOM(this.dataObject);
    const document = dom.window.document;

    // Find the element with class "article-link"
    const articleLinkElement = document.querySelector(".article-link");

    //if no article links (shouldnt happen)
    if (!articleLinkElement) return null;

    // Find all anchor tags within the article-link element (puts them in an)
    const linkElementArray = articleLinkElement.querySelectorAll("a");
    const parseLinkModel = new Parse(linkElementArray);

    //get article List array
    const articleListArray = await parseLinkModel.parseLinkArray();

    //sort the array
    const sortModel = new UTIL(articleListArray);
    const articleListSort = await sortModel.sortArrayByDate();

    //add article ID
    const idModel = new UTIL(articleListSort);
    const articleListStore = await idModel.addArticleIdArray();

    const storeDataModel = new dbModel(articleListStore, CONFIG.articleURLs);
    const storeData = await storeDataModel.storeArray();
    console.log(storeData);

    //noramlize article list
    return articleListArray;
  }

  async parseLinkArray() {
    //define things
    const linkElementArray = this.dataObject;
    const articleListArray = [];
    const urlConstant = "http://www.kcna.kp";

    //loop through a tags and pull out hrefs
    for (let i = 0; i < linkElementArray.length; i++) {
      const href = linkElementArray[i].getAttribute("href");
      const url = urlConstant + href; //build full url

      //GET DATE
      const dateElement = linkElementArray[i].querySelector(".publish-time");
      if (!dateElement) continue;
      const dateText = dateElement.textContent.trim();
      const dateModel = new Parse(dateText);
      const articleDate = await dateModel.parseDateElement();

      //build obj
      const listObj = {
        url: url,
        date: articleDate,
      };

      console.log("NOW FUCKING HERE");
      console.log(listObj);

      articleListArray.push(listObj); //add to array
    }
  }

  //breaks out date parsing
  async parseDateElement() {
    const dateText = this.dataObject;
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
