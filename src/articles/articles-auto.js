import { getArticleListHtml } from "./articles-get";
import { parseArticleListHtml } from "./articles-parse";
import { storeArticleListArray } from "./articles-store";

export const getNewArticles = async () => {
  //gets html from page with current list of articles
  const articleListHtml = await getArticleListHtml();

  //get the article list array from current articles html
  const articleListArray = await parseArticleListHtml(articleListHtml);
  await storeArticleListArray(articleListArray); //store the article list
};
