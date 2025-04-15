import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { postPicFS } from "../pics/pics-upload.js";
import { normalizeArticleInputs } from "./articles-util.js";
import { sendMessageChunkTG } from "../tg-api.js";

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
  if (!articleToPostArray) {
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

/**
 * loops through articleContent collection, posting each item to TG
 * @function postArticleArray
 * @returns number of articles posted
 */
export const postArticleArray = async (articleArray) => {
  //sorts array FIRST, sorts from OLDEST TO NEWEST (by id low to high)
  articleArray.sort((a, b) => a.articleId - b.articleId);

  //loop through array
  for (let i = 0; i < articleArray.length; i++) {
    try {
      //post each article obj (starting with pics)
      const articleObj = articleArray[i];
      const articlePostData = postArticleObj(articleObj);

      //check if data returned, otehrwise store it
      if (!articlePostData) return null;
      const storeModel = new dbModel(articlePostData, CONFIG.articlePostedCollection);
      await storeModel.storeUniqueURL();

      console.log("DONE YOU STUPID MOTHERFUCKER");
      return articlePostData.length;
    } catch (e) {
      console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    }
  }
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

  console.log(picPostedArray);

  //POST ARTICLE HERE
  //build postObj
  const postObj = await normalizeArticleInputs(articleObj);
  const articleLength = await postArticleTG(postObj);

  //if article failed to post return if any pics posted (efficient way of writing it per claude)
  if (!articleLength) return { picsPosted: picPostedArray } || null;

  //otherwise build and return postObj
  postObj.articleLength = articleLength;
  if (picPostedArray?.length > 0) postObj.picsPosted = picPostedArray;

  return postObj;
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

  //sorts array LOW TO HIGH
  picArray.sort((a, b) => a.kcnaId - b.kcnaId);

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
};

export const postArticleTG = async (inputObj) => {
  const { url, date, title, content } = inputObj; //destructure everything
  const maxLength = CONFIG.tgMaxLength - title.length - date.length - url.length - 100;
  const chunkTotal = Math.ceil(content.length / maxLength);

  //set  base params
  const params = {
    chat_id: CONFIG.articleSendToId,
    parse_mode: "HTML",
  };

  //if short enough send normally
  if (content.length < maxLength) {
    params.text = title + "\n" + date + "\n\n" + content + "\n\n" + url;
    await sendMessageChunkTG(params);
    return content.length;
  }

  //otherwise send in chunks
  let chunkCount = 0;
  for (let i = 0; i < content.length; i += maxLength) {
    chunkCount++;
    const chunk = content.substring(i, i + maxLength);
    //if first message
    if (chunkCount === 1) {
      params.text = title + "\n" + date + "\n\n" + chunk;
      await sendMessageChunkTG(params);
      continue;
    }

    //if last messagse
    if (chunkCount === chunkTotal) {
      params.text = chunk + "\n\n" + url;
      await sendMessageChunkTG(params);
      continue;
    }

    //otherwise send just chunk
    params.text = chunk;
    await sendMessageChunkTG(params);
  }

  return content.length;
};

export const postChunkTG = async (chunk) => {};
