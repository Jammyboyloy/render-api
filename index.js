const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files in uploads folder
  },
  filename: (req, file, cb) => {
    // use original file name or you can generate a unique name
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// In-memory articles
let articles = [];
const baseImageUrl = "https://render-api-kb6j.onrender.com/uploads/";

// GET all articles
app.get("/api/articles", (req, res) => {
  const result = articles.map(a => ({
    ...a,
    image: a.image ? baseImageUrl + a.image : null
  }));
  res.json(result);
});

// POST create article with file upload
app.post("/api/articles", upload.single("image"), (req, res) => {
  const { title, category, content } = req.body;
  const file = req.file; // uploaded file

  if (!title || !category || !content) {
    return res.status(400).json({ message: "Title, category, and content are required" });
  }

  const newId = articles.length > 0 ? articles[articles.length - 1].id + 1 : 1;

  const newArticle = {
    id: newId,
    title,
    category,
    content,
    image: file ? file.filename : null, // save filename
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

// PUT, GET by ID, DELETE can stay same as before

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
