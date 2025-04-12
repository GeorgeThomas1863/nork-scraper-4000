import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

import { parseArticleListHtml, parseArticleContentHtml } from "./articles-parse.js";
import { storeArticleArray } from "./articles-store.js";
import { sortArticleDataArray } from "./articles-util.js";
import { downloadPicsFS } from "../pics/pics-download.js";

export const getNewArticleURLs = async () => {
  //gets html from page with current list of articles
  const articleListModel = new KCNA({ url: CONFIG.articleListURL });
  const articleListHtml = await articleListModel.getHTML();

  //get the article list array from current articles html
  await parseArticleListHtml(articleListHtml);

  //store the article list STORED ELSWEHERE
  // await storeArticleArray(articleListArray, CONFIG.articleListCollection);

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

  //add article data to content for storage
  const articleDataArray = [];

  //loop through input array
  for (let i = 0; i < inputArray.length; i++) {
    const article = inputArray[i].url;
    const articleObj = await getNewArticleObj(article);
    if (!articleObj) continue;
    articleDataArray.push(articleObj);
  }

  //if no new articles return null
  if (!articleDataArray || articleDataArray.length === 0) return null;

  //normalize / sort array / add articleId
  const normalArray = await sortArticleDataArray(articleDataArray);

  //store normal array by looping through it
  await storeArticleArray(normalArray, CONFIG.articleContentCollection);

  return normalArray.length;
};

export const getNewArticleObj = async (article) => {
  const articleModel = new KCNA({ url: article });
  const articleHtml = await articleModel.getHTML();

  //parse article HTML (most of heavy lifting)
  const articleObj = await parseArticleContentHtml(articleHtml, article);

  //if article has pics download them (if not downloaded already)
  if (articleObj && articleObj.articlePicArray) {
    console.log("HERE FAGGOT");
    await downloadPicsFS(articleObj.articlePicArray);
  }

  return articleObj;
};
