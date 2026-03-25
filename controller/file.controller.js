const FileModel = require("../model/file.model");
const fs = require("fs");
const path = require("path");

const getType = (type) => {
  const ext = type.split("/").pop();

  if (ext === "x-msdownload") {
    return "application/exe";
  }

  return type;
};

const createFile = async (req, res) => {
  try {
    console.log(req.user);
    const { filename } = req.body;
    const file = req.file;
    const payload = {
      path: `${file.destination}${file.filename}`,
      filename: filename,
      filetype: getType(file.mimetype),
      size: file.size,
      user: req.user.id,
    };
    const newFile = await FileModel.create(payload);
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchFiles = async (req, res) => {
  try {
    const files = await FileModel.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(201).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileModel.findByIdAndDelete(id);

    if (!file) {
      return res.status(404).json({ message: "File not found!!" });
    }

    fs.unlinkSync(file.path);
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileModel.findById(id);
    const extension = file.filetype.split("/").pop();

    if (!file) {
      return res.status(404).json({ message: "File not found!!" });
    }

    const root = process.cwd();
    const filePath = path.join(root, file.path);

    //🌟 code is responsible to force browser to download the file
    res.setHeader(
      "Content-Disposition",
      `attachement; filename="${file.filename}.${extension}"`,
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: "File not found" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFile,
  fetchFiles,
  deleteFile,
  downloadFile,
};
