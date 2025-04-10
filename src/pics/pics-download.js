/**
 * Finds new pics and downloads them, does NOT uplaod them
 * @function downloadPicsFS
 * @returns number of new pics (length of newPicURLs array)
 */
export const downloadPicsFS = async (picArray) => {
  for (let i = 0; i < picArray.length; i++) {
    console.log("AHHHHHHHHHHHHHH");
    console.log(picArray[i]);
    return null;
    // try {
    //   const pic = picArray[i];

    //   //check if pic has been downloaded
    //   const storePicModel = new dbModel(pic, CONFIG.downloadedCollection);
    //   await storePicModel.urlNewCheck(); //throws error if pic already downloaded

    //   //otherwise build params to download
    //   const downloadPicParams = {
    //     url: pic.url,
    //     savePath: pic.picPath,
    //   };

    //   console.log(downloadPicParams);

    //   //download pic
    //   const downloadPicModel = new KCNA(downloadPicParams);
    //   const downloadPicData = await downloadPicModel.downloadPicFS();
    //   console.log(downloadPicData);

    //   //store pic was downloaded
    //   const storePicDownloaded = await storePicModel.storeUniqueURL();
    //   console.log(storePicDownloaded);
    // } catch (e) {
    //   console.log(e.url + "; " + e.message + "; F BREAK: " + e.function);
    // }
  }
};
