import { getNewPicURLs } from "./pics-urls.js";

/**
 * Finds new pics and downloads them, does NOT uplaod them
 * @function runPicsScrape
 * @returns number of new pics (length of newPicURLs array)
 */
export const runPicsScrape = async () => {
  console.log("STARTING PIC SCRAPE");
  //get / find new articles
  const newPicURLs = await getNewPicURLs();
  console.log(newPicURLs);
  console.log("FINISHED GETTING PICS");

  //DOWNLOAD PICS (DONT UPLOAD HERE)
  //check if any new, return null if not
  if (!newPicURLs || newPicURLs.length === 0) return null;
  //otherwise download new articles
  await downloadPicsFS(newPicURLs);
  //return number of new articles
  return newPicURLs.length;
};
