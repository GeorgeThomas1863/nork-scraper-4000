import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

export const addArticleId = async (inputArray) => {
  //return null on blank input
  if (!inputArray) return null;

  const arrayNormal = [];

  //get the current article id, returns 0 if doesnt exist
  const currentArticleId = await getArticleId();

  //sort input array by DATE OLDEST to NEWEST
  inputArray.sort((a, b) => {
    // Convert datetime strings to Date objects if needed
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    return dateA - dateB;
  });

  // loop through input array (of OBJs) adding articleId identifier
  for (let i = 0; i < inputArray.length; i++) {
    const inputObj = inputArray[i];
    const normalObj = { ...inputObj };

    //add in articleId
    normalObj.articleId = i + currentArticleId;

    // Add to the output array
    arrayNormal.push(normalObj);
  }

  return arrayNormal;
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
