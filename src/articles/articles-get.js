import CONFIG from "../../config/scrape-config.js";

import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

import { parseArticleListHtml, parseArticleContentHtml } from "./articles-parse.js";
import { storeArticleArray } from "./articles-store.js";

export const getNewArticleURLs = async () => {
  //gets html from page with current list of articles
  const articleListModel = new KCNA({ url: CONFIG.articleListURL });
  const articleListHtml = await articleListModel.getHTML();

  //get the article list array from current articles html
  const articleListArray = await parseArticleListHtml(articleListHtml);
  await storeArticleArray(articleListArray, CONFIG.articleListCollection); //store the article list

  //collections being compared
  const checkParams = {
    collection1: CONFIG.articleListCollection, //list of article URLs (just updated)
    collection2: CONFIG.articleContentCollection, //list of articles content already downloaded
  };
  //pulls out the ones not already downloaded
  const checkModel = new dbModel(checkParams, "");
  const newArticleURLs = await checkModel.findNewURLs();
  return newArticleURLs;
};

//input is array of objects
export const getNewArticleData = async (inputArray) => {
  //return if input empty (shouldnt happen)
  if (!inputArray || inputArray.length === 0) return;

  //loop through input array
  for (let i = 0; i < inputArray.length; i++) {
    const article = inputArray[i].url;
    const articleModel = new KCNA({ url: article });
    const articleHtml = await articleModel.getHTML();

    const articleObj = await parseArticleContentHtml(articleHtml, article);
    const storeModel = new dbModel(articleObj, CONFIG.articleContentCollection);
    const storeTest = await storeModel.storeUniqueURL();
    console.log(storeTest);
    console.log(articleObj);
  }
  return true;
};

// /**
//  * GETs article array of ONLY NEW SHIT (urls) for specified type; so always downloading / uploading new stuff, skipping already done stuff
//  * @function getArticleArray
//  * @param {string} type - Type of articles to get ("articlesToDownload" or "articlesToUpload")
//  * @returns {Promise<Array>} Array of article objects
//  */
// export const getArticleArray = async (type) => {
//   let params = "";

//   //return on error input
//   if (type !== "articlesToDownload" && type !== "articlesToUpload") return;

//   if (type === "articlesToDownload") {
//     params = {
//       collection1: CONFIG.articleListCollection, //old thing, to compare against
//       collection2: CONFIG.articleContentCollection, //new thing, what this funct is doing
//     };
//   }

//   if (type === "articlesToUpload") {
//     params = {
//       collection1: CONFIG.articleContentCollection,
//       collection2: CONFIG.articlePostedCollection,
//     };
//   }

//   const articleModel = new dbModel(params, "");
//   const articleArray = await articleModel.findNewURLs();
//   return articleArray;
// };
