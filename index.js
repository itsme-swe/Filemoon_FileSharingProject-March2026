const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
mongoose.connect(process.env.DB);

const express = require("express");
const { v4: uniqueID } = require("uuid");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    const extensionArr = file.originalname.split(".");
    const extension = extensionArr.pop();
    const uniqueName = `${uniqueID()}.${extension}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1000 * 1000,
  },
});

const {
  signup,
  login,
  updateProfileImage,
  fetchProfileImage,
} = require("./controller/user.controller");
const {
  createFile,
  fetchFiles,
  deleteFile,
  downloadFile,
} = require("./controller/file.controller");
const { fetchDashboard } = require("./controller/dashboard.controller");
const { verifyToken } = require("./controller/token.controller");
const { shareFile, fetchShareFile } = require("./controller/share.controller");
const getPath = require("./utils/getPath.utilis");
const AuthMiddleware = require("./middleware/auth.middleware");
const app = express();
app.listen(process.env.PORT || 8080);

//🌟 app level middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("view"));

//🌟 Frontend UI routing
app.get("/signup", (req, res) => {
  res.sendFile(getPath("signup.html"));
});

app.get("/", (req, res) => {
  res.sendFile(getPath("index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(getPath("index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(getPath("app/dashboard.html"));
});

app.get("/files", (req, res) => {
  res.sendFile(getPath("app/files.html"));
});

app.get("/history", (req, res) => {
  res.sendFile(getPath("app/history.html"));
});

// 🌟 Backend APIs (End Points)
app.post("/api/signup", signup);
app.post("/api/login", login);
app.post(
  "/api/profile-img",
  AuthMiddleware,
  upload.single("picture"),
  updateProfileImage,
);
app.get("/api/profile-img", AuthMiddleware, fetchProfileImage);
app.post("/api/file", AuthMiddleware, upload.single("file"), createFile); //🌟 Here we are using route level middleware
app.get("/api/file", AuthMiddleware, fetchFiles);
app.delete("/api/file/:id", AuthMiddleware, deleteFile);
app.get("/api/file/download/:id", downloadFile);
app.get("/api/dashboard", AuthMiddleware, fetchDashboard);
app.post("/api/token/verify", verifyToken);
app.post("/api/share", AuthMiddleware, shareFile);
app.get("/api/share", AuthMiddleware, fetchShareFile);

// 🌟 Not found routes
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});
