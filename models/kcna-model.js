/**
 * @fileoverview Content fetching and file management model for KCNA articles / pics
 * @module models/KCNA
 */

import axios from "axios";
import fs from "fs";
import fsPromises from "fs/promises";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

//set default file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @class KCNA
 * @description Handles fetching, saving, and managing content from external sources
 * @classdesc A class for retrieving HTML content, determining content types, saving HTML files,
 * and downloading images to a local filesystem.
 */
class KCNA {
  /**
   * @constructor
   * @param {Object} dataObject - The data object with request parameters
   */
  constructor(dataObject) {
    this.dataObject = dataObject;
  }

  /**
   * Fetches HTML content from the specified URL (works for any url), returns as text
   * @function getHTML
   * @returns {Promise<string>} The HTML content as text
   * @throws {Error} Logs the error to console if the request fails
   */
  async getHTML() {
    try {
      const res = await fetch(this.dataObject.url);
      // console.log(res);
      const data = await res.text();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Saves HTML content to the filesystem
   * @function saveHTMLFS
   * @param {string} inputData - The HTML content to save
   * @returns {Promise<number>} The size of the saved file in bytes
   * @throws {Error} Propagates any file system errors
   */
  async saveHTMLFS(inputData) {
    const filePath = join(__dirname, "../data", this.dataObject.fileName);
    await fsPromises.writeFile(filePath, inputData);
    const fileSize = await this.getFileSizeFS(filePath); //ensure data saved
    return fileSize;
  }

  /**
   * Calculates the size of a file on file system (the one saved)
   * @function getFileSizeFS
   * @param {string} filePath - The path of the file to check
   * @returns {Promise<number>} The size of the file in bytes, or 0 if the file doesn't exist
   * @throws {Error} Logs the error message to console but returns 0
   */
  async getFileSizeFS(filePath) {
    try {
      const fileData = await fsPromises.stat(filePath);
      return fileData.size;
    } catch (e) {
      console.log(e.message);
      return 0;
    }
  }

  /**
   * Gets the content type of the resource at the specified URL (to check if PIC or not)
   * @function getDataType
   * @param picURL (as value for url in obj)
   * @returns {Promise<string|null>} if pic returns picObj, otherwise throws error
   */
  // async getDataType() {
  async getPicData() {
    const picURL = this.dataObject.url;
    const res = await fetch(picURL);

    //if URL doesnt exist / return headers throw error
    if (!res || !res.headers) {
      const error = new Error("URL DOESNT EXIST");
      error.url = picURL;
      error.function = "getPicData KCNA MODEL";
      throw error;
    }

    const headerData = res.headers;

    console.log("HEADER DATA");
    console.log(headerData);

    //otherwise return the data type
    const dataType = headerData.get("content-type");

    //if not pic throw error
    if (!dataType || dataType !== "image/jpeg") {
      const error = new Error("NOT A PIC");
      error.url = picURL;
      error.function = "getPicData KCNA MODEL";
      throw error;
    }

    //otherwise get data about pic and add to obj //TEST
    const picSize = headerData.get("content-length");
    const serverData = headerData.get("server");
    const eTag = headerData.get("last-modified");
    const picDate = new Date(headerData.get("date"));
    const picEditDate = new Date(headerData.get("last-modified"));

    const picObj = {
      url: picURL,
      dateType: dataType,
      serverData: serverData,
      eTag: eTag,
      picSize: picSize,
      picDate: picDate,
      picEditDate: picEditDate,
    };

    return picObj;
  }

  /**
   * Downloads an image from a URL and saves it to the filesystem
   * @function downloadPicFS
   * @returns {Promise<string>} The URL of the downloaded image
   * @throws {Error} Enhanced error object with URL and function name if download fails
   */
  async downloadPicFS() {
    const picURL = this.dataObject.url;
    const savePath = this.dataObject.savePath;

    try {
      const res = await axios.get(picURL, {
        responseType: "stream",
        // timeout: 5000,
      });

      const writer = fs.createWriteStream(savePath);
      const stream = res.data.pipe(writer);
      const picSize = parseInt(res.headers["content-length"], 10);
      let downloadedSize = 0;

      console.log("DOWNLOADING PIC " + picSize + "B");

      //download shit
      res.data.on("data", (chunk) => {
        downloadedSize += chunk.length;
        if (downloadedSize >= picSize) {
          // console.log("All data chunks downloaded.");
          // console.log(picURL);
        }
      });

      await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      return picSize;
    } catch (error) {
      error.url = picURL;
      error.function = "downloadPicFS";
      throw error;
    }
  }
}

export default KCNA;
