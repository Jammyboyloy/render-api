const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS
app.use(cors());
app.use(express.json());

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Serve uploaded files
app.use("/upload", express.static(uploadDir));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// In-memory articles
let articles = [];
const baseImageUrl = "https://render-api-kb6j.onrender.com/upload/";

// -------------------- ROUTES --------------------

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

// POST create article
app.post("/api/articles", upload.single("image"), (req, res) => {
  const { title, content, author } = req.body;
  const file = req.file;

  if (!title || !content || !author) {
    return res.status(400).json({ message: "Title, content, and author are required" });
  }

  const newId = articles.length > 0 ? articles[articles.length - 1].id + 1 : 1;

  const newArticle = {
    id: newId,
    title,
    content,
    author,
    image: file ? file.filename : null
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

// PUT update article
app.put("/api/articles/:id", upload.single("image"), (req, res) => {
  const id = parseInt(req.params.id);
  const articleIndex = articles.findIndex(a => a.id === id);
  if (articleIndex === -1) return res.status(404).json({ message: "Article not found" });

  const { title, content, author } = req.body;
  const file = req.file;

  if (title) articles[articleIndex].title = title;
  if (content) articles[articleIndex].content = content;
  if (author) articles[articleIndex].author = author;
  if (file) articles[articleIndex].image = file.filename;

  res.json({
    message: "Article updated successfully",
    data: {
      ...articles[articleIndex],
      image: articles[articleIndex].image ? baseImageUrl + articles[articleIndex].image : null
    }
  });
});

// DELETE article
app.delete("/api/articles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = articles.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ message: "Article not found" });

  const deleted = articles.splice(index, 1)[0];

  // Remove uploaded file
  if (deleted.image) {
    const filePath = path.join(uploadDir, deleted.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.json({
    message: "Article deleted successfully",
    data: {
      ...deleted,
      image: deleted.image ? baseImageUrl + deleted.image : null
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
