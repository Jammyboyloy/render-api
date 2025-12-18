const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// in-memory data
let articles = [];

// GET
app.get("/api/articles", (req, res) => {
  res.json(articles);
});

// POST (AUTO ID)
app.post("/api/articles", (req, res) => {
  const { title } = req.body;

  const newId = articles.length > 0
    ? articles[articles.length - 1].id + 1
    : 1;

  const newArticle = {
    id: newId,
    title
  };

  articles.push(newArticle);

  // show ID in Render logs
  console.log("POST SUCCESS, ID:", newId);

  res.status(201).json({
    message: "Article created successfully",
    id: newId,
    data: newArticle
  });
});

app.listen(PORT, () => {
  console.log("API running on Render");
});
