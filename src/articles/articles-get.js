import CONFIG from "../../config/scrape-config.js";

import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

/**
 * GETS HTML of the main page that contains a list of articles (no input params)
 * @function getArticleListHtml
 * @returns {Promise<string>} HTML content of page with list of articles
 */
export const getArticleListHtml = async () => {
  const articleListObj = {
    url: CONFIG.articleListURL,
    fileName: "articleList.html",
  };

  //get article list
  const articleListModel = new KCNA(articleListObj);
  const articleListHtml = await articleListModel.getHTML();

  return articleListHtml;
};

/**
 * GETs article array of ONLY NEW SHIT (urls) for specified type; so always downloading / uploading new stuff, skipping already done stuff
 * @function getArticleArray
 * @param {string} type - Type of articles to get ("articlesToDownload" or "articlesToUpload")
 * @returns {Promise<Array>} Array of article objects
 */
export const getArticleArray = async (type) => {
  let params = "";

  //return on error input
  if (type !== "articlesToDownload" && type !== "articlesToUpload") return;

  if (type === "articlesToDownload") {
    params = {
      collection1: CONFIG.articleListCollection, //old thing, to compare against
      collection2: CONFIG.articleContentCollection, //new thing, what this funct is doing
    };
  }

  if (type === "articlesToUpload") {
    params = {
      collection1: CONFIG.articleContentCollection,
      collection2: CONFIG.articlePostedCollection,
    };
  }

  const articleModel = new dbModel(params, "");
  const articleArray = await articleModel.findNewURLs();
  return articleArray;
};
