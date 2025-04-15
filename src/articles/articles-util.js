import CONFIG from "../../config/scrape-config.js";
import dbModel from "../../models/db-model.js";

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
