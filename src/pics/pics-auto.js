import { getNewPicURLs } from "./pics-urls.js";
import { downloadNewPics } from "./pics-download.js";

/**
 * Finds new pics and downloads them, does NOT uplaod them
 * @function runPicsScrape
 * @returns number of pics downloaded (length of newPicURLs array)
 */
export const runPicsScrape = async () => {
  console.log("STARTING PIC SCRAPE");
  //get / find new pics (returns Mongo comparison of new pics)
  const newPicURLs = await getNewPicURLs();
  console.log("FOUND FOLLOWING NEW PICS:");
  console.log(newPicURLs);

  //otherwise download new PICS
  const picsDownloaded = await downloadNewPics();
  console.log("FINISHED DOWNLOADING FOLLOWING PICS");
  console.log(picsDownloaded);

  //return number of new pics downloaded
  return picsDownloaded.length;
};
