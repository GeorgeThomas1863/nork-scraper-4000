import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

import { postPicFS } from "../pics/pics-upload.js";

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

//posts BOTH articles and pics
export const postArticleArray = async (articleArray) => {
  //loop through array
  for (let i = 0; i < articleArray.length; i++) {
    //first check if article has pics
    const articleObj = articleArray[i];
    console.log("AHHHHHHHHH3");

    const articlePicsPosted = await postArticlePicArray(articleObj);
    console.log(articlePicsPosted);

    //NEXT POST ARTICLE CONTENT
  }
  console.log("DONE YOU DUMB MOTHERFUCKER");
  return articleArray.length;
};

//TAKES FULL ARTICLE OBJ AS INPUT
export const postArticlePicArray = async (articleObj) => {
  //if article has no pics return
  if (!articleObj || !articleObj.articlePicArray || articleObj.articlePicArray.length === 0) return null;
  console.log("AHHHHHHH4");

  //extract out article pic array
  const { articlePicArray } = articleObj;

  //loop through article Pic array
  for (i = 0; i < articlePicArray.length; i++) {
    //post individual pic
    const postData = await postArticlePic(articlePicArray[i]);
    console.log(postData);
  }
  return articlePicArray.length;
};

export const postArticlePic = async (articlePicItem) => {
  const { url, picPath } = articlePicItem;

  //build pic param
  const picParams = {
    chatId: CONFIG.articleSendToId,
    url: url,
    picPath: picPath,
  };
  console.log(picParams);

  //post pic
  const postPicData = await postPicFS(picParams);
  return postPicData;
};
