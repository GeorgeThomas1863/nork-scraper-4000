import { getNewArticleURLs, getNewArticleContent } from "./articles-get.js";

export const runArticleScrape = async () => {
  console.log("STARTING ARTICLE SCRAPE");
  //get / find new articles
  const newArticleURLs = await getNewArticleURLs();
  console.log("FINISHED GETTING ARTICLE URLs");

  //download new articles (uses mongo to check if any new)
  const newArticleContent = await getNewArticleContent();
  if (!newArticleContent) return null;
  console.log("FINISHED GETTING CONTENT FOR THIS MANY NEW ARTICLES:");
  console.log(newArticleContent.length);

  //return number of new articles
  return newArticleURLs.length;
};
