import { getNewArticleURLs, getNewArticleData } from "./articles-get.js";

export const runArticleScrape = async () => {
  //get / find new articles
  const newArticleURLs = await getNewArticleURLs();
  console.log(newArticleURLs);
  return;
  //check if any new, return null if not
  if (!newArticleURLs || newArticleURLs.length === 0) return null;
  //otherwise download new articles
  await getNewArticleData(newArticleURLs);
};
