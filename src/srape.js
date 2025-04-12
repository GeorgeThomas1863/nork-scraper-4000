import { runArticleScrape } from "./articles/articles-auto.js";
import { postNewArticles } from "./articles/articles-post.js";
import { runPicsScrape } from "./pics/pics-auto.js";

export const runAutoScrape = async () => {
  await scrapeKCNA();
  await postToTG();
};

export const scrapeKCNA = async () => {
  await runArticleScrape();
  await runPicsScrape();
};

export const postToTG = async () => {
  //will post articles ALONG with their pics
  await postNewArticles();
};
