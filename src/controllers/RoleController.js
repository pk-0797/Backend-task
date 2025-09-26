const roleModel = require("../models/RoleModel");

const addRole = async (req, res) => {
  const savedRole = await roleModel.create(req.body);
  res.json({
    message: "Role Created.",
    data: savedRole,
  });
};

module.exports = {
  addRole,
};
