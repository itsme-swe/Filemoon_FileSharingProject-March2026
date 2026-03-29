const UserModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const signup = async (req, res) => {
  try {
    await UserModel.create(req.body);
    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });

    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isLogin = bcrypt.compareSync(password, user.password); // .compareSync() function returns boolean value

    // Is code ka matlab hai ki "isLogin" ka value false hai toh code ko execute karo
    if (!isLogin)
      return res.status(401).json({ message: "Invalid credentials " });

    // 🌟 This is how we generate token and send it with successfull msg
    const payload = {
      email: user.email,
      mobile: user.mobile,
      fullname: user.fullname,
      id: user._id,
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "Login Successfully", token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const { filename } = req.file;
    const user = await UserModel.findByIdAndUpdate(req.user.id, {
      image: filename,
    });

    if (!user) return res.status(401).json({ message: "Invalid request" });

    res.status(200).json({ image: user.image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchProfileImage = async (req, res) => {
  try {
    const { image } = await UserModel.findById(req.user.id);

    if (!image) res.status(500).json({ message: "Image not found" });
    const root = process.cwd();
    const file = path.join(root, "files", image);
    res.sendFile(file, (err) => {
      if (err) res.status(404).json({ message: "Image not found" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  updateProfileImage,
  fetchProfileImage,
};
