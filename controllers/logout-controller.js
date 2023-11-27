const User = require("../models/userModel");

const logoutUser = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwtToken) return res.sendStatus(204);

  const refreshToken = cookies.jwtToken;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    res.clearCookie("jwtToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.sendStatus(204);
  }

  foundUser.refreshToken = foundUser?.refreshToken.filter(
    (token) => token !== refreshToken
  );

  await foundUser.save();

  res.clearCookie("jwtToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.json({ message: "User logged out successfully" });
};

module.exports = { logoutUser };
