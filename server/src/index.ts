import express from "express";

const app = express();

app.get("/status", (req, res) => {
  return res.status(200).json({
    health: true,
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server run at port ${port}`);
});
