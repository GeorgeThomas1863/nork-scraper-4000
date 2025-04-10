import { getNewPicURLs } from "./pics-urls.js";

export const runPicsScrape = async () => {
  console.log("STARTING SCRAPE");
  //get / find new articles
  const newPicURLs = await getNewPicURLs();
  console.log(newPicURLs);
  console.log("FINISHED GETTING ARTICLES");

  //   //check if any new, return null if not
  //   if (!newArticleURLs || newArticleURLs.length === 0) return null;
  //   //otherwise download new articles
  //   await getNewArticleData(newArticleURLs);
  //   //return number of new articles
  //   return newArticleURLs.length;
};
