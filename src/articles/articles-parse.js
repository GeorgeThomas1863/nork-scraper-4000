import { JSDOM } from "jsdom";

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
    articleListArray.push(url); //add to array
  }

  return articleListArray;
};
