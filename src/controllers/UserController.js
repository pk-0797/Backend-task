const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });
    const hashed = bcrypt.hashSync(password, 8);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "User",
    });
    const u = user.toObject();
    delete u.password;
    res.status(201).json({ message: "Created", data: u });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const u = user.toObject();
    delete u.password;
    res.json({ message: "Logged in", data: u });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ data: users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { signup, login, getAllUsers };
