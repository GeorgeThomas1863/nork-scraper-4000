import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { postPicFS } from "../pics/pics-upload.js";

/**
 * Finds new articles to post and posts them WITH their pics (posting pics first)
 * @function postNewArticles
 * @returns number of articles posted?
 */
export const postNewArticles = async () => {
  const postParams = {
    collection1: CONFIG.articleContentCollection, //list of article URLs (just updated)
    collection2: CONFIG.articlePostedCollection, //list of articles content already downloaded
  };
  const postModel = new dbModel(postParams, "");
  const articleToPostArray = await postModel.findNewURLs();

  // console.log(articleToPostArray);
  //no new articles
  if (!articleToPostArray || articleToPostArray.length === 0) {
    console.log("NO NEW ARTICLES");
    return null;
  }
  //otherwise post article array
  const postArrayData = await postArticleArray(articleToPostArray);
  return postArrayData;
};

/**
 * Loops through array of article OBJs, posting each (starting with the pics in that OBJ)
 * @function postArticleArray
 * @param {Array} articleArray array of article OBJs (from articleContent collection)
 * @returns number posted?
 */
//posts BOTH articles and pics
export const postArticleArray = async (articleArray) => {
  //loop through array
  for (let i = 0; i < articleArray.length; i++) {
    //first check if article has pics
    const articleObj = articleArray[i];
    console.log("AHHHHHHHHH3");

    const articlePostData = postArticleObj(articleObj);

    // const articlePicsPosted = await postArticlePicArray(articleObj);
    // console.log(articlePicsPosted);

    // const articleContentPosted = await postArticleContent(articleObj);

    //NEXT POST ARTICLE CONTENT
  }
  console.log("DONE YOU DUMB MOTHERFUCKER");
  return articleArray.length;
};

/**
 * Takes 1 FULL article OBJ and posts it (starting with pics on article if any)
 * @function postArticleObj
 * @param {articleObj} articleObj
 * @returns
 */
export const postArticleObj = async (articleObj) => {
  //extract out article pic array
  const { articlePicArray } = articleObj;

  const picPostedArray = await postArticlePicArray(articlePicArray);
  // console.log(picPostedArray);
  console.log("DONE POSTING PICS FOR ARTICLE");

  //POST ARTICLE HERE

  // return articlePicArray.length;
  return;
};

/**
 * Loops through array of article pics (if any), posting each
 * @function postArticlePicArray
 * @param {Array} picArray (articlePicArray)
 * @returns array of picOBJs posted
 */
export const postArticlePicArray = async (picArray) => {
  //if article has NO pics return null
  if (!picArray || picArray.length === 0) return null;
  //track pics posted
  const picPostedArray = [];

  //loop through article Pic array
  for (let i = 0; i < picArray.length; i++) {
    //post individual pic
    const picObj = picArray[i];
    const postData = await postArticlePic(picObj);
    // console.log(postData);
    //if not posted, try next
    if (!postData) continue;

    //otherwise add to array
    picPostedArray.push(picObj);
  }

  return picPostedArray;
};

/**
 * Posts EACH article picOBJ, builds params, uses TG api to post (lets api deal with token)
 * @function postArticlePic
 * @param {} picObj OBJ with data for article PIC
 * @returns data if pic posted, null if NOT
 */
export const postArticlePic = async (picObj) => {
  //add tg chatId to params
  const picParams = { ...picObj };
  picParams.chatId = CONFIG.articleSendToId;

  const postPicData = await postPicFS(picParams);
  return postPicData;

  //post pic
  // try {
  //   const postPicData = await postPicFS(picParams);
  //   return postPicData;
  // } catch (e) {
  //   console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
  // }
};
