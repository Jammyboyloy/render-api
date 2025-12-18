const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// in-memory data
let articles = [];

// GET article by ID
app.get("/api/articles/:id", (req, res) => {
  const id = parseInt(req.params.id); // get ID from URL
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.json(article);
});

// POST (AUTO ID)
app.post("/api/articles", (req, res) => {
  const { title } = req.body;

  const newId = articles.length > 0 ? articles[articles.length - 1].id + 1 : 1;

  const newArticle = {
    id: newId,
    title,
  };

  articles.push(newArticle);

  // show ID in Render logs
  console.log("POST SUCCESS, ID:", newId);

  res.status(201).json({
    message: "Article created successfully",
    id: newId,
    data: newArticle,
  });
});

app.listen(PORT, () => {
  console.log("API running on Render");
});
