import dbModel from "../../models/db-model.js";

export const sortArticleDataArray = async (inputArray) => {
  //return null on blank input
  if (!inputArray || !inputArray.date || inputArray.length === 0) return null;

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
    arrayNormal.push(newObj);
  }

  return arrayNormal;
};

export const getArticleId = async () => {
  const dataModel = new dbModel({ keyToLookup: "articleId" }, CONFIG.articleContentCollection);
  const articleIdStored = dataModel.findMaxId();

  //if doesnt exists
  if (!articleIdStored) return 0;

  //otherwise return stored value +1
  return articleIdStored + 1;
};
