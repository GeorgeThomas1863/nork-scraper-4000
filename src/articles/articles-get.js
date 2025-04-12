import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

import { parseArticleListHtml, parseArticleContentHtml } from "./articles-parse.js";
import { downloadPicFS } from "../pics/pics-download.js";
import { storeArticleArray } from "./articles-store.js";
import { addArticleId } from "./articles-util.js";

/**
 * Finds new article URLs by parsing main KCNA article page and comparing with urls already downloaded
 * @function getNewArticleURLs
 * @returns array of new URLs
 */
export const getNewArticleURLs = async () => {
  //gets html from page with current list of articles
  const articleListModel = new KCNA({ url: CONFIG.articleListURL });
  const articleListHtml = await articleListModel.getHTML();

  //get the article list array from current articles html
  const articleListArray = await parseArticleListHtml(articleListHtml);
  console.log("ANDN NOW HERE FUCKER");
  console.log(articleListArray);

  const normalListArray = await addArticleId(articleListArray);

  // console.log("AHHHHHHHHHHHH");
  // console.log(normalListArray);

  //stores unique
  await storeArticleArray(normalListArray, CONFIG.articleListCollection);

  //check if any new
  const checkParams = {
    collection1: CONFIG.articleListCollection, //list of article URLs (just updated)
    collection2: CONFIG.articleContentCollection, //list of articles content already downloaded
  };

  //pulls out articles not already downloaded
  const checkModel = new dbModel(checkParams, "");
  const newArticleURLs = await checkModel.findNewURLs();
  return newArticleURLs;
};

/**
 * Loops through array of url OBJECTs, goes to KCNA url, builds dataObj for EACH
 * @function getNewArticleData
 * @param {*} inputArray array of objects (each of which has url to kcna article)
 * @returns array of OBJECTS with data about each KCNA article
 */
export const getNewArticleData = async (inputArray) => {
  //return if input empty (shouldnt happen)
  if (!inputArray) return null;

  //add article data to content for storage
  const articleDataArray = [];

  //loop through input array
  for (let i = 0; i < inputArray.length; i++) {
    const listObj = inputArray[i].url;
    try {
      const articleObj = await getNewArticleObj(listObj);
      if (!articleObj) continue;

      //store it
      const storeModel = new dbModel(articleObj, CONFIG.articleContentCollection);
      await storeModel.storeUniqueURL(); //throws error if not unique

      //if successful add to array
      articleDataArray.push(articleObj);
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }

  return articleDataArray;
};

/**
 * Gets HTML from KCNA url and extracts ject content (passes heavy lifting to parseArticleContentHtml)
 * Handles pics with article as well
 * @function getNewArticleObj
 * @param {} article - (url for KCNA article)
 * @returns Object with data about kcna article and any pics it has
 */
export const getNewArticleObj = async (listObj) => {
  const articleModel = new KCNA({ url: listObj.url });
  const articleHtml = await articleModel.getHTML();

  //parse article HTML (most of heavy lifting)
  const articleObj = await parseArticleContentHtml(articleHtml, article);

  //if article has pics download them (if not downloaded already)
  if (articleObj && articleObj.articlePicArray) {
    //check if any NOT in pics db
    const newPics = await checkArticlePics(articleObj.articlePicArray);
    console.log(newPics.length);
  }

  return articleObj;
};

/**
 * Checks whether any of the article pics are new, stores them AND downloads them if new
 * @function checkArticlePics
 * @param {*} picArray -picArray on the article Object
 * @returns array of new pics
 */
export const checkArticlePics = async (picArray) => {
  const picNewArray = [];
  //loop through pics
  for (let i = 0; i < picArray.length; i++) {
    try {
      const picObj = picArray[i];

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

  return picNewArray;
};
