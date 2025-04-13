import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

import { parseArticleListHtml, parseArticleContentHtml } from "./articles-parse.js";
import { downloadPicFS } from "../pics/pics-download.js";
import { sortArticleArray, getArticleId } from "./articles-util.js";

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
  const articleListArray = await parseArticleListHtml(articleListHtml);

  //NORMALIZE list by soring by date, add in id AND storing the ARRAY
  const normalListArray = await getNormalArticleList(articleListArray);
  console.log("NORMAL LIST ARRAY");
  console.log(normalListArray);

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

      //check article pics (if any new download) AFTER storing Content
      const newPicsArray = await checkArticlePics(articleObj);
      console.log(newPicsArray.length); //new pics downloaded with article
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

/**
 * Checks whether any of the article pics are new, stores them AND downloads them if new
 * @function checkArticlePics
 * @param {*} picArray -picArray on the article Object
 * @returns array of new pic OBJECTS
 */
export const checkArticlePics = async (articleObj) => {
  if (!articleObj) return null;

  //return null if article has no pics
  const { articlePicArray } = articleObj;
  if (!articleObj.articlePicArray || !articleObj.articlePicArray.length) return null;

  const picNewArray = [];
  //loop through pics
  for (let i = 0; i < articlePicArray.length; i++) {
    try {
      const picObj = articlePicArray[i];

      //store any NOT in pic collection
      const picNewModel = new dbModel(picObj, CONFIG.picCollection);
      await picNewModel.storeUniqueURL(); //will throw error if NOT unique

      //download if new (downloadPicFS checks if new)
      await downloadPicFS(picObj);

      //if all successful add to array
      picNewArray.push(picObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  //unnecessary, just for tracking
  return picNewArray;
};
