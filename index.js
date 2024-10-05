const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

// MongoDB connection string from environment variables
const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost:27017/patientzerodb";

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, PatientZero is up and running with MongoDB!");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`App running on http://localhost:${port}`);
});
