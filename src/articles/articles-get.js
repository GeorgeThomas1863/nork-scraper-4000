import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";

import dbModel from "../../models/db-model.js";
import Parse from "../../models/parse-model.js";
import UTIL from "../../models/util-model.js";

import { parseArticleListHtml, parseArticleContentHtml } from "./articles-parse.js";
// import { sortArticleArray, getArticleId } from "./articles-util.js";
// import { buildPicObj } from "../pics/pics-urls.js";

/**
 * Finds new article URLs by parsing main KCNA article page and comparing with urls already downloaded
 * @function getNewArticleURLs
 * @returns array of Objects with new URLs
 */
export const getNewArticleURLs = async () => {
  //gets html from page with current list of articles
  const articleListModel = new KCNA({ url: CONFIG.articleListURL });
  const articleListHtml = await articleListModel.getHTML();

  //get the article list array from current articles html
  const parseModel = new Parse(articleListHtml);
  const articleListArray = await parseModel.parseArticleList();

  //just for tracking
  return articleListArray;
};

/**
 * Loops through array of url OBJECTs, goes to KCNA url, builds dataObj for EACH
 * @function getNewArticleContent
 * @param {*} inputArray array of objects (each of which has url to kcna article)
 * @returns array of OBJECTS with data about each KCNA article
 */
export const getNewArticleContent = async () => {
  const checkModel = new UTIL({ type: "articleDownload" });
  const inputArray = await checkModel.getNewArray();

  //return if input empty (shouldnt happen)
  if (!inputArray || !inputArray.length) return null;

  //add article data to content for storage
  const articleContentArray = [];

  //loop through input array
  for (let i = 0; i < inputArray.length; i++) {
    const listObj = inputArray[i];
    console.log("HERE FAGGOT");

    console.log(listObj);

    try {
      const articleObj = await getNewArticleObj(listObj);
      if (!articleObj) continue;

      //if successful (no error) add to array
      articleContentArray.push(articleObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  return articleContentArray;
};

/**
 * Gets HTML from KCNA url and extracts ject content (passes heavy lifting to parseArticleContentHtml)
 * Handles pics with article as well
 * @function getNewArticleObj
 * @param {} article - (url for KCNA article)
 * @returns Object with data about kcna article and any pics it has
 */
export const getNewArticleObj = async (listObj) => {
  const articleModel = new KCNA(listObj);
  const articleHtml = await articleModel.getHTML();

  //parse article HTML (most of heavy lifting)
  const articleObj = await parseArticleContentHtml(articleHtml, listObj);
  console.log("ARTICLE OBJECT");
  console.log(articleObj);

  //store it HERE
  // const storeModel = new dbModel(articleObj, CONFIG.articleContentCollection);
  // await storeModel.storeUniqueURL(); //throws error if not unique

  return articleObj;
};
