const express = require("express");
const app = express();
const router = require("./router.ts");
const createError = require("http-errors");
const port = process.env.PORT || "4000";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log("Listening to the port!");
});

app.use("/", router);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.send("error");
});

module.exports = app;
