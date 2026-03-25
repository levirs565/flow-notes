import express from "express";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();

app.get("/status", (req, res) => {
  return res.status(200).json({
    health: true,
  });
});

const port = parseInt(process.env.PORT ?? "3000");
app.listen(port, () => {
  console.log(`Server run at port ${port}`);
});
