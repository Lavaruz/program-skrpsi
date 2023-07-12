const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParse = require("cookie-parser");
const fs = require("fs");

const app = express();

if (!fs.existsSync("public/files/uploads")) {
  if (!fs.existsSync("public/files")) {
    fs.mkdirSync("public/files");
  }
  if (!fs.existsSync("public/files/uploads")) {
    fs.mkdirSync("public/files/uploads");
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files/uploads");
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, Date.now() + Math.floor(Math.random() * 99) + 1 + "." + extension);
  },
});

app.enable("trust proxy");
app.use(multer({ storage: storage, limits: { fileSize: 200000 } }).any());
app.use(cors());
app.use(cookieParse());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/files", express.static(path.join(__dirname, "public", "files")));
app.use("/", express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ROUTER
const db = require("./src/models");
const utilsRouter = require("./src/routers/utilsRoute");
const webRouter = require("./src/routers/webRouter");
const analyzrRouter = require("./src/routers/analyzeRoute");

app.use("/", webRouter);
app.use("/api/analyze", analyzrRouter);
app.use("/api/utils", utilsRouter);

// ERROR HANDLER
app.all("*", (req, res, next) => {
  const err = new Error(`can't find ${req.originalUrl} on the server!`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
  });
});

let PORT = process.env.PORT || 3000;
db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log("server run at port " + PORT));
});
