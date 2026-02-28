const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const apiRoutes = require("./routes");
const { notFound } = require("./middleware/notFound");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/", apiRoutes);
app.use(notFound);

app.listen(port, () => {
  console.log(`VELORA API running on port ${port}`);
});
