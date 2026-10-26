const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    message: "Backend is running inside Docker!"
  });
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Backend running on port 5000");
});
