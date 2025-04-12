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
    const article = articleArray[i];
    console.log("AHHHHHHHHH3");

    await postArticlePic(article);

    //NEXT POST ARTICLE CONTENT
  }
};

export const postArticlePic = async (article) => {
  //if article has no pics return
  if (!article || !article.articlePicArray || article.articlePicArray.length === 0) return null;
  console.log("AHHHHHHH4");

  //otherwise build params
  const picParams = {
    chatId: CONFIG.articleSendToId,
    url: article.articlePicArray.url,
    picPath: article.articlePicArray.picPath,
  };
  console.log(picParams);

  //post pic
  const postPicData = await postPicFS(picParams);
  return postPicData;
};
