import { runArticleScrape } from "./articles/articles-auto.js";
import { postNewArticles } from "./articles/articles-post.js";
import { runPicsScrape } from "./pics/pics-auto.js";

export const runAutoScrape = async () => {
  await scrapeKCNA();

  //REMOVE
  return;

  await postToTG();
};

export const scrapeKCNA = async () => {
  await runArticleScrape();

  //REMOVE
  return;

  await runPicsScrape();
  console.log("FINISHED SCRAPING");
};

export const postToTG = async () => {
  console.log("NOW POSTING ARTICLES (with their pics)");
  //will post articles ALONG with their pics
  await postNewArticles();
};
