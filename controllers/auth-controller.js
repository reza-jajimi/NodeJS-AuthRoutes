const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//================================ Register User =================================

const registerUser = async (req, res) => {
  // Get user input
  const { first_name, last_name, email, password, role } = req.body;

  try {
    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const oldUser = await User.findOne({ email }).exec();

    if (oldUser) {
      return res
        .status(409)
        .send("The user is registered in the system with this email");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      role: !role ? { user: 3003 } : role,
    });

    // return new user
    res.status(201).json({ user });
  } catch (err) {
    console.log(err);
  }
};

//================================= Login User ===================================

const loginUser = async (req, res) => {
  // Get cookies from request
  const cookies = req.cookies;

  // Get user input
  const { email, password } = req.body;

  try {
    // Validate user input
    if (!(email && password)) {
      return res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const user = await User.findOne({ email }).exec();

    if (!user) return res.status(401).send("Email is wrong");

    // Match the password that was encrypted with the bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return res.status(401).send("Incorrect password");

    // get user role
    const role = Object.values(user.role).filter(Boolean);

    // Create access token
    const accessToken = jwt.sign(
      { userInfo: { role, email: user.email } },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "10m" }
    );

    // Create refresh token
    const newRefreshToken = jwt.sign(
      { userId: { role, email: user.email } },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "12h" }
    );

    // Check that user has a token
    let newRefreshTokenArray = !cookies?.jwtToken
      ? user.refreshToken
      : user.refreshToken.filter((token) => token !== cookies.jwtToken);

    if (cookies?.jwtToken) {
      const refreshToken = cookies.jwtToken;
      const foundToken = await User.findOne({ refreshToken }).exec();

      if (!foundToken) {
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwtToken", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
    }

    // Add new refresh token to database
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();

    // set new refresh token to cookie
    res.cookie("jwtToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 12,
    });

    return res.json({
      user,
      accessToken,
      message: ` Dear ${user.first_name}, welcome to your user panel`,
    });
  } catch (err) {
    console.log(err);
  }
};

//===============================================================================

module.exports = { loginUser, registerUser };
