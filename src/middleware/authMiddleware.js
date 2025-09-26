const User = require("../models/UserModel");

const requireUser = async (req, res, next) => {
  try {
    const userId = req.headers["userid"] || req.body.userid || req.query.userid;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Invalid user" });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
};

module.exports = {
  requireUser,
  requireRole,
};
