import { getNewArticleURLs, getNewArticleData } from "./articles-get.js";

export const runArticleScrape = async () => {
  console.log("STARTING SCRAPE");
  //get / find new articles
  const newArticleURLs = await getNewArticleURLs();
  console.log("FINISHED GETTING ARTICLES");

  //check if any new, return null if not
  if (!newArticleURLs || newArticleURLs.length === 0) return null;
  //otherwise download new articles
  await getNewArticleData(newArticleURLs);
  //return number of new articles
  return newArticleURLs.length;
};
