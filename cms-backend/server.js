require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
const { testConnection } = require("./config/db");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.66:3000"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

readdirSync("./routes/").map((c) => {
  app.use(require("./routes/" + c));
});

const port = process.env.EXPRESS_PORT;
app.listen(port, () => {
  console.log(`Server express running on port ${port}`);
});
