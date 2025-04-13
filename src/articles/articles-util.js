import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

/**
 * Function that sorts an array of article OBJECTS by DATE
 * @param {} inputArray
 * @returns sorted Array of article OBJECTS (sorted by date oldest to newest)
 */
export const sortArticleArray = async (inputArray) => {
  //return null on blank input
  if (!inputArray || !inputArray.length) return null;

  // Create a copy of the array to avoid modifying the original
  const sortArray = [...inputArray];

  //sort input array by DATE OLDEST to NEWEST
  sortArray.sort((a, b) => {
    // Convert datetime strings to Date objects if needed
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    return dateA - dateB;
  });

  return sortArray;
};

export const getArticleId = async () => {
  const dataModel = new dbModel({ keyToLookup: "articleId" }, CONFIG.articleContentCollection);
  const articleIdStored = await dataModel.findMaxId();

  //if doesnt exists
  if (!articleIdStored) return 0;

  //otherwise return stored value +1
  return articleIdStored + 1;
};

export const normalizeArticleInputs = async (inputObj) => {
  const { url, date, title, content } = inputObj;

  //might have to change name of url here
  const urlNormal = url.replace(/\./g, "[.]").replace(/:/g, "[:]");
  const dateRaw = date;
  const dateNormal = new Date(dateRaw).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const titleNormal = `<b>${title}</b>`;

  const outputObj = {
    url: urlNormal,
    date: dateNormal,
    title: titleNormal,
    content: content,
  };

  return outputObj;
};
