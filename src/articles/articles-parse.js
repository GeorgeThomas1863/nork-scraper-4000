import { JSDOM } from "jsdom";

import CONFIG from "../../config/scrape-config.js";
import KCNA from "../../models/kcna-model.js";
import dbModel from "../../models/db-model.js";

import { buildPicObj } from "../pics/pics-urls.js";

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
  console.log("LINK ELEMENTS");
  console.log(linkElements[0]);

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
  };

  //get article PAGE (if exists) where all pics are displayed
  const mediaIconElement = document.querySelector(".media-icon");
  const picPageHref = mediaIconElement?.firstElementChild?.getAttribute("href");

  //return article obj if no pic
  if (!picPageHref) return articleObj;

  //otherwise build pic / pic array
  const picPageURL = "http://www.kcna.kp" + picPageHref;
  const articlePicArray = await parsePicPageHtml(picPageURL);

  //add to object and return
  articleObj.picPageURL = picPageURL;
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

export const parsePicPageHtml = async (picPageURL) => {
  //get the html, build dom
  const htmlModel = new KCNA({ url: picPageURL });
  const html = await htmlModel.getHTML();

  //if fails return null
  if (!html) return null;

  //otherwise parse html
  const dom = new JSDOM(html);
  const document = dom.window.document;

  //define return array
  const articlePicArray = [];

  //get and loop through img elements
  const imgArray = document.querySelectorAll("img");
  for (let i = 0; i < imgArray.length; i++) {
    const imgItem = imgArray[i];
    if (!imgItem) continue;

    const imgSrc = imgItem.getAttribute("src");
    const picObj = await buildArticlePicObj(imgSrc);
    if (!picObj) continue;

    articlePicArray.push(picObj);
  }

  return articlePicArray;
};

export const buildArticlePicObj = async (imgSrc) => {
  if (!imgSrc) return null;

  //extract picURL
  const picURL = "http://www.kcna.kp" + imgSrc;

  //extract kcnaId
  const picPathNum = imgSrc.substring(imgSrc.length - 11, imgSrc.length - 4);
  if (!picPathNum) return null;
  const kcnaId = String(Number(picPathNum));

  //extract out stupid date string
  const dateString = imgSrc.substring(imgSrc.indexOf("/photo/") + "/photo/".length, imgSrc.indexOf("/PIC", imgSrc.indexOf("/photo/")));

  //build pic OBJ from PIC URL file (checks if new AND stores it)
  const picObj = await buildPicObj(picURL, kcnaId, dateString);

  console.log("ARTICLE PIC OBJECT");
  console.log(picObj);

  return picObj;
};
