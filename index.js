const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base URL for images
const baseImageUrl = "https://render-api-kb6j.onrender.com/uploads/";

// In-memory data
let articles = [];

// GET all articles
app.get("/api/articles", (req, res) => {
  const result = articles.map(a => ({
    ...a,
    image: a.image ? baseImageUrl + a.image : null
  }));
  res.json(result);
});

// GET article by ID
app.get("/api/articles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const article = articles.find(a => a.id === id);

  if (!article) return res.status(404).json({ message: "Article not found" });

  res.json({
    ...article,
    image: article.image ? baseImageUrl + article.image : null
  });
});

// POST create new article
app.post("/api/articles", (req, res) => {
  const { title, category, content, image } = req.body; // image = filename

  if (!title || !category || !content) {
    return res.status(400).json({ message: "Title, category, and content are required" });
  }

  const newId = articles.length > 0 ? articles[articles.length - 1].id + 1 : 1;

  const newArticle = {
    id: newId,
    title,
    category,
    content,
    image: image || null // store only filename
  };

  articles.push(newArticle);

  res.status(201).json({
    message: "Article created successfully",
    data: {
      ...newArticle,
      image: newArticle.image ? baseImageUrl + newArticle.image : null
    }
  });
});

// PUT update article by ID
app.put("/api/articles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, category, content, image } = req.body;

  const articleIndex = articles.findIndex(a => a.id === id);
  if (articleIndex === -1) return res.status(404).json({ message: "Article not found" });

  if (title) articles[articleIndex].title = title;
  if (category) articles[articleIndex].category = category;
  if (content) articles[articleIndex].content = content;
  if (image !== undefined) articles[articleIndex].image = image; // filename

  res.json({
    message: "Article updated successfully",
    data: {
      ...articles[articleIndex],
      image: articles[articleIndex].image ? baseImageUrl + articles[articleIndex].image : null
    }
  });
});

// DELETE article by ID
app.delete("/api/articles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const articleIndex = articles.findIndex(a => a.id === id);
  if (articleIndex === -1) return res.status(404).json({ message: "Article not found" });

  const deletedArticle = articles.splice(articleIndex, 1);

  res.json({
    message: "Article deleted successfully",
    data: {
      ...deletedArticle[0],
      image: deletedArticle[0].image ? baseImageUrl + deletedArticle[0].image : null
    }
  });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
