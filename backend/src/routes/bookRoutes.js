import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); 
   const { title, author, caption, rating, image } = req.body;

if (!image || !title || !caption || !rating || !author) {
  return res.status(400).json({ message: "Please provide all fields" });
}

const uploadResponse = await cloudinary.uploader.upload(image);
const imageUrl = uploadResponse.secure_url;

const newBook = new Book({
  title,
  author,
  caption,
  rating,
  image: imageUrl,
  user: req.user._id,
});

await newBook.save();

res.status(201).json(newBook);

  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { title, author, caption, rating, image } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // only owner can edit
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // if image is updated
    if (image && image !== book.image) {
      if (book.image && book.image.includes("cloudinary")) {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadResponse = await cloudinary.uploader.upload(image);
      book.image = uploadResponse.secure_url;
    }

    // update fields (only if provided)
    if (title) book.title = title;
    if (author) book.author = author;
    if (caption) book.caption = caption;
    if (rating) book.rating = rating;

    await book.save();

    res.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", protectRoute, async (req, res) => {
  
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 2;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) // desc
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();
 
    res.send({
      books,
      // currentPage: page,
      // totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/qyup61vejflxxw8igvi0.png
    // delete image from cloduinary as well
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

  //get favorites
  router.get("/favorites/me", protectRoute, async(req,res) => {
    try {
      const user = await User.findById(req.user._id).populate({path: "favorites",
        populate:{ path: "user", select:"username profileImage"} }
      );
      res.json(user.favorites);
    } catch (error){
        res.status(500).json({message: error.message});
      }
  });

//ADD TO FAVORTITES

 router.post("/:id/favorites", protectRoute, async (req,res)=>{
    try{
      const bookId = req.params.id;

      const user = await User.findById(req.user._id);

      if (user.favorites.includes(bookId)){
        return res.status(400).json({ message: "Book is already added in the favorites"});
      }
          user.favorites.push(bookId);
          await user.save();

          res.json({message: "Added to favorites"});
      } catch (error){
        res.status(500).json({message: error.message});
      }
  });
  //delete favorites
  router.delete("/:id/favorites", protectRoute, async (req,res)=>{
    try{
      const bookId = req.params.id;

      const user = await User.findById(req.user._id);
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== bookId
      );

      await user.save();
      res.json({message:"Removed from the favorites"});
    }catch (error) {
      res.status(500).json({message:error.message});
    }
  });


export default router;
