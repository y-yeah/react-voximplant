const express = require("express");
const router = express.Router();
const axios = require("axios");

const baseUrl = "https://api.voximplant.com/platform_api";
const accountId = process.env.REACT_APP_ACCOUNT_ID;
const apiKey = process.env.REACT_APP_API_KEY;
const appId = process.env.REACT_APP_APP_ID;

router.get("/", (req, res) => {
  res.send("Hello, world!");
});

router.post("/addUser", (req, res) => {
  const { username, userDisplayName, password } = req.body;

  const addUser = async () => {
    const route = "/AddUser";
    const path = `${baseUrl}${route}/?account_id=${accountId}&api_key=${apiKey}&user_name=${username}&user_display_name=${userDisplayName}&user_password=${password}&application_id=${appId}`;
    try {
      const info = await axios.post(path, null);
      if (info.data && info.data.error) {
        throw info.data.error;
      }
      res.status(200).send(info.data);
    } catch (error) {
      console.error(error);
    }
  };

  addUser();
});

module.exports = router;
