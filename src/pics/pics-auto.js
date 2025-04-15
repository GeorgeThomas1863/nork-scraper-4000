import { getNewPicURLs } from "./pics-urls.js";
import { downloadPicArray } from "./pics-download.js";

/**
 * Finds new pics and downloads them, does NOT uplaod them
 * @function runPicsScrape
 * @returns number of pics downloaded (length of newPicURLs array)
 */
export const runPicsScrape = async () => {
  console.log("STARTING PIC SCRAPE");
  //get / find new pics (returns Mongo comparison of new pics)
  const newPicURLs = await getNewPicURLs();

  //checks in MONGO if any new
  if (!newPicURLs || !newPicURLs.length) return null;

  //otherwise download new PICS
  const picsDownloaded = await downloadPicArray(newPicURLs);
  console.log("FINISHED DOWNLOADING NEW PICS");

  //return number of new pics downloaded
  return picsDownloaded.length;
};
