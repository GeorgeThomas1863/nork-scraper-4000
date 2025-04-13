import { getNewArticleURLs, getNewArticleContent } from "./articles-get.js";

export const runArticleScrape = async () => {
  console.log("STARTING ARTICLE SCRAPE");
  //get / find new articles
  const newArticleURLs = await getNewArticleURLs();
  console.log("FINISHED GETTING ARTICLE URLs");

  //check if any new, return null if not (returns array of objs, so length needed to check)
  if (!newArticleURLs || !newArticleURLs.length) return null;

  //otherwise download new articles
  const newArticleContent = await getNewArticleContent(newArticleURLs);
  console.log("FINISHED GETTING CONTENT FOR THIS MANY NEW ARTICLES:");
  console.log(newArticleContent.length);

  //return number of new articles
  return newArticleURLs.length;
};
