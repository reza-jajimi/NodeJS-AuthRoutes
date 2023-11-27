const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const corsOption = require("./config/corsOption");
const credentials = require("./middleware/credentials");
const app = express();

//=========================== Middleware =================================
app.use(credentials);
app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//============================== Public routes =================================
app.use("/api", require("./routes/users"));
app.use("/api", require("./routes/logout"));

// This should be the last route else any after it won't work
app.all("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found!",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

// handle error routes
app.use((err, req, res) => {
  res.status(500).send(err.message);
});

//=============== Connect to database & Server running =====================
const port = process.env.PORT || 3500;

mongoose
  .connect(process.env.MONGO_URL)
  .then(
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    })
  )
  .catch((err) => console.log(err));
