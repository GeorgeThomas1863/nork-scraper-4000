import { runArticleScrape } from "./articles/articles-auto.js";

export const scrapeKCNA = async () => {
  await runArticleScrape();
};
