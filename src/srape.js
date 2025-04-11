import { runArticleScrape } from "./articles/articles-auto.js";
import { runPicsScrape } from "./pics/pics-auto.js";

export const scrapeKCNA = async () => {
  await runArticleScrape();
  const testData = await runPicsScrape();
  console.log(testData);
  console.log("FUCKING DONE");
};
