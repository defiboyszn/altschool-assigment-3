const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { config } = require("dotenv");

config();
const User = require("./models/User");
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(
  process.env.MONGO_DB,
);

app.use(express.json());
app.use(express.static("public"));

app.post("/add-user", async (req, res) => {
  try {
    const { username, email, dob } = req.body;
    const user = new User({ username, email, dob });
    await user.save();
    res.status(201).send("User added successfully!");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Cron job to send birthday emails at 7am every day
cron.schedule("0 7 * * *", async () => {
  const today = new Date();
  const users = await User.find({ dob: { $eq: today } }).exec();
  users.forEach((user) => {
    sendBirthdayEmail(user);
  });
});

async function sendBirthdayEmail(user) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tobithealpha@gmail.com",
      pass: process.env.APP_PASS,
    },
  });

  const mailOptions = {
    from: "Tobi From Mars <tobithealpha@gmail.com>",
    to: user.email,
    subject: `Happy Birthday ${user.username}!!`,
    text: `Dear ${user.username},\n\nHappy birthday! We wish you all the best on your special day.\n\nBest regards,\nYDefiboy`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
