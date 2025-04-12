import { JSDOM } from "jsdom";

import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

/**
 * Parses the main page HTML to extract a list of article URLs
 * @function parseArticleListHtml
 * @param {string} html - HTML content of the main page
 * @returns {Promise<Array<Object>>} Array of objects containing article URLs
 */
export const parseArticleListHtml = async (html) => {
  //define things
  const articleListArray = [];
  const urlConstant = "http://www.kcna.kp";

  // console.log(html)
  // return

  // Parse the HTML using JSDOM
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the element with class "article-link"
  const articleLinkElement = document.querySelector(".article-link");

  //if no article links (shouldnt happen)
  if (!articleLinkElement) return null;

  // Find all anchor tags within the article-link element (puts them in an)
  const linkElements = articleLinkElement.querySelectorAll("a");

  //loop through a tags and pull out hrefs
  for (let i = 0; i < linkElements.length; i++) {
    const href = linkElements[i].getAttribute("href");
    const url = urlConstant + href; //build full url

    //GET DATE
    const dateElement = linkElements[i].querySelector(".publish-time");
    if (!dateElement) continue;
    const dateText = dateElement.textContent.trim();
    const articleDate = await parseDateElement(dateText);

    //build obj
    const listObj = {
      url: url,
      date: articleDate,
    };

    articleListArray.push(listObj); //add to array
  }

  return articleListArray;
};

/**
 * Parses the HTML content of a SINGLE article; extracts / returns data as an object
 * (might want to do in model but doing here for now)
 * @function parseArticleContentHtml
 * @param {string} html - HTML content of the article page
 *  @param {string} url - url of page being parsed
 * @returns {Promise<Object>} Article object with title, date, content and picture URL
 */
export const parseArticleContentHtml = async (html, listObj) => {
  //use destructurign here ...listObj
  const { url, articleId, date } = listObj;
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Extract the title - KCNA uses article-main-title class
  const titleElement = document.querySelector(".article-main-title");
  const articleTitle = titleElement?.textContent?.replace(/\s+/g, " ").trim();

  //get article PAGE (if exists) where all pics are displayed
  const mediaIconElement = document.querySelector(".media-icon");
  const hrefURL = mediaIconElement?.firstElementChild?.getAttribute("href");
  const picURL = await parsePicURL(hrefURL);

  //break out content parsing
  const contentElement = document.querySelector(".content-wrapper");
  const contentArray = contentElement.querySelectorAll("p"); //array of paragraph elements
  const articleContent = await parseArticleContent(contentArray);

  //build and return obj
  const articleObj = {
    articleId: articleId,
    url: url,
    title: articleTitle,
    date: date,
    content: articleContent,
    picURL: picURL,
  };

  //if no article pics return here
  if (!picURL) return articleObj;

  //otherwise get article pics before returning
  const articlePicArray = await parseArticlePicHtml(picURL);
  articleObj.articlePicArray = articlePicArray;

  return articleObj;
};

//breaks out date parsing
export const parseDateElement = async (dateText) => {
  //return null if empty
  if (!dateText) return null;

  const dateRaw = dateText.replace(/[\[\]]/g, "");

  // Convert the date string (YYYY.MM.DD) to a JavaScript Date object, then split to arr
  const dateArr = dateRaw.split(".");
  const year = parseInt(dateArr[0]);
  // JS months are 0-based (subtract 1 at end)
  const month = parseInt(dateArr[1]);
  const day = parseInt(dateArr[2]);

  // Validate the date; if fucked return null
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const articleDate = new Date(year, month - 1, day);
  return articleDate;

  // //extract date OLD VERSION BELOW
  // const dateRaw = dateElement.textContent.replace('www.kcna.kp ', '').replace(/[\(\)]/g, '').trim(); //prettier-ignore
  // const year = parseInt(dateRaw.substring(0, 4));
  // const month = parseInt(dateRaw.substring(5, 7));
  // const day = parseInt(dateRaw.substring(8, 10));

  // Validate the date; if fucked return null
  // if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // // otherwise create and return a new Date object (month is 0-indexed in JavaScript)
  // const articleDate = new Date(year, month - 1, day);
};

export const parsePicURL = async (hrefURL) => {
  //if empty input return null
  if (!hrefURL) return null;

  //otherwise return the string
  return "http://www.kcna.kp" + hrefURL;
};

export const parseArticleContent = async (contentArray) => {
  let paragraphArray = [];

  for (let i = 0; i < contentArray.length; i++) {
    paragraphArray.push(contentArray[i].textContent.trim());
  }

  // Join paragraphs with double newlines for better readability
  const articleContent = paragraphArray.join("\n\n");
  return articleContent;
};

export const parseArticlePicHtml = async (picURL) => {
  //get the html, build dom
  const htmlModel = new KCNA({ url: picURL });
  const html = await htmlModel.getHTML();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  //define return array
  const articlePicArray = [];

  //get and loop through img elements
  const imgElements = document.querySelectorAll("img");
  for (let i = 0; i < imgElements.length; i++) {
    const imgItem = imgElements[i];
    if (!imgItem || !imgItem.getAttribute("src")) {
      continue;
    }

    const imgSrc = imgItem.getAttribute("src");
    const picObj = await parseImgSrc(imgSrc);
    if (!picObj) continue;

    articlePicArray.push(picObj);
  }

  return articlePicArray;
};

export const parseImgSrc = async (imgSrc) => {
  if (!imgSrc) return null;

  const picPathNum = imgSrc.substring(imgSrc.length - 11, imgSrc.length - 4);
  if (!picPathNum) return null;
  const kcnaId = String(Number(picPathNum));

  //extract out stupid date string
  const dateString = imgSrc.substring(imgSrc.indexOf("/photo/") + "/photo/".length, imgSrc.indexOf("/PIC", imgSrc.indexOf("/photo/")));

  //build and return picObj
  const picObj = {
    url: "http://www.kcna.kp" + imgSrc,
    picPath: CONFIG.savePicPathBase + kcnaId + ".jpg",
    kcnaId: +kcnaId,
    dateString: dateString,
  };
  return picObj;
};
