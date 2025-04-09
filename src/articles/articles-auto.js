import { getArticleListHtml, getArticleArray } from "./articles-get";
import { parseArticleListHtml } from "./articles-parse";
import { storeArticleListArray } from "./articles-store";

export const runArticleScrape = async () => {
    //get / find new articles
    const newArticleURLs  = await getNewArticleURLs()
    //check if any new, return null if not
    if (!newArticleURLs || newArticleURLs.length === 0) return null
    //otherwise download new articles
    await downloadNewArticles(newArticleURLs)
}


export const getNewArticleURLs = async () => {
  //gets html from page with current list of articles
  const articleListHtml = await getArticleListHtml();

  //get the article list array from current articles html
  const articleListArray = await parseArticleListHtml(articleListHtml);
  await storeArticleListArray(articleListArray); //store the article list

  //identifies new urls NOT downloaded
  const newArticleURLs = await getArticleArray("articlesToDownload");
  return newArticleURLs
};

//input is array of objects
export const downloadNewArticles = async (inputArray) => {
    
    //return if input empty (shouldnt happen)
    if (!inputArray || inputArray.length === 0) return

    //loop through input array
    for (let i = 0; i < inputArray.length; i++) {
        const article = inputArray[i].url
    }


}
