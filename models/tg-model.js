/**
 * @fileoverview Telegram API request handling model
 * @module models/TgReq
 */

//import mods
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

import tokenArray from "../config/tg-bot.js";

/**
 * @class TgReq
 * @description Handles requests to the Telegram Bot API
 * @classdesc A class for making different types of requests to the Telegram Bot API,
 * including GET requests for updates, POST requests for commands, and file uploads for photos.
 */
class TgReq {
  /**
   * @constructor
   * @param {Object} dataObject - The data object to be sent in requests
   * @param {number} [dataObject.offset] - The offset for getUpdates requests
   * @param {string} [dataObject.chatId] - The chat ID for sending messages or media
   * @param {string} [dataObject.picPath] - The file path for image uploads
   */
  constructor(dataObject) {
    this.dataObject = dataObject;
  }

  /**
   * Sends a GET request to the Telegram API to fetch updates
   * @function tgGet
   * @param {number} tokenIndex - Index of the bot token to use from the tokenArray
   * @returns {Promise<Object>} The JSON response from the Telegram API
   * @throws {Error} Logs the error to console if the request fails
   */
  async tgGet(tokenIndex) {
    const token = tokenArray[tokenIndex];
    const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${this.dataObject.offset}`;

    //send data
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Sends a POST request to the Telegram API with the specified command
   * @function tgPost
   * @param {string} command - The Telegram API command to execute (e.g., 'sendMessage')
   * @param {number} tokenIndex - Index of the bot token to use from the tokenArray
   * @returns {Promise<Object>} The JSON response from the Telegram API
   * @throws {Error} Logs the error to console if the request fails
   */
  async tgPost(command, tokenIndex) {
    const token = tokenArray[tokenIndex];
    const url = `https://api.telegram.org/bot${token}/${command}`;

    //send data
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(this.dataObject),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Uploads and sends a photo to a Telegram chat using the Telegram API
   * @function tgPicFS
   * @param {number} tokenIndex - Index of the bot token to use from the tokenArray
   * @returns {Promise<Object>} The JSON response from the Telegram API
   * @throws {Error} Logs detailed error information if the request fails
   */
  async tgPicFS(tokenIndex) {
    const token = tokenArray[tokenIndex];
    const url = `https://api.telegram.org/bot${token}/sendPhoto`;
    //build form
    const form = new FormData();
    form.append("chat_id", this.dataObject.chatId), form.append("photo", fs.createReadStream(this.dataObject.picPath));

    //upload Pic
    try {
      const response = await axios.post(url, form, {
        headers: form.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.log("UPLOAD FUCKED");
      if (error && error.response && error.response.data) {
        console.log(error.response.data);
        return error.response.data;
      } else {
        return error;
      }
    }
  }
}

export default TgReq;
