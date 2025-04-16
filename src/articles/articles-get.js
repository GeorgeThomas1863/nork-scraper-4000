import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";
import Parse from "../../models/parse-model.js";

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
  const parseModel = new Parse({ html: articleListHtml });
  const articleListArray = await parseModel.parseArticleList();
  console.log("ARTICLE LIST ARRAY");
  console.log(articleListArray);

  // //NORMALIZE list by soring by date, add in id AND storing the ARRAY
  // const normalListArray = await getNormalArticleList(articleListArray);
  // console.log("NORMAL LIST ARRAY");
  // console.log(normalListArray);

  //check if any new
  const checkParams = {
    collection1: CONFIG.articleListCollection, //list of article URLs (just updated)
    collection2: CONFIG.articleContentCollection, //list of articles content already downloaded
  };

  //pulls out articles not already downloaded by USING MONGO aftFer functions run (NOT results of functions)
  const checkModel = new dbModel(checkParams, "");
  const newArticleURLs = await checkModel.findNewURLs();
  return newArticleURLs;
};

/**
 * Normalizes the Article list by sorting by date and adding in ID (oldest to newest)
 * @function getNormalArticleList
 * @param {} inputArray (raw article list array)
 * @returns
 */
export const getNormalArticleList = async (inputArray) => {
  //return null on blank input
  if (!inputArray || !inputArray.length) return null;

  //get the current article id, returns 0 if doesnt exist
  const arrayNormal = [];
  const currentArticleId = await getArticleId();

  const sortArray = await sortArticleArray(inputArray);

  // loop through input array (of OBJs) adding articleId identifier
  for (let i = 0; i < sortArray.length; i++) {
    try {
      const inputObj = sortArray[i];
      const normalObj = { ...inputObj };

      //add in articleId
      normalObj.articleId = i + currentArticleId;

      //STORE THE BITCH HERE (throws error if any not new)
      const articleModel = new dbModel(normalObj, CONFIG.articleListCollection);
      await articleModel.storeUniqueURL();

      // Add to the output array
      arrayNormal.push(normalObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  //just for tracking, not necessary
  return arrayNormal;
};

/**
 * Loops through array of url OBJECTs, goes to KCNA url, builds dataObj for EACH
 * @function getNewArticleContent
 * @param {*} inputArray array of objects (each of which has url to kcna article)
 * @returns array of OBJECTS with data about each KCNA article
 */
export const getNewArticleContent = async (inputArray) => {
  //return if input empty (shouldnt happen)
  if (!inputArray || !inputArray.length) return null;

  //add article data to content for storage
  const articleContentArray = [];

  //loop through input array
  for (let i = 0; i < inputArray.length; i++) {
    const listObj = inputArray[i];
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

  //store it HERE
  const storeModel = new dbModel(articleObj, CONFIG.articleContentCollection);
  await storeModel.storeUniqueURL(); //throws error if not unique

  return articleObj;
};
