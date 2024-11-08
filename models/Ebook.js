import mongoose from "mongoose";

const EbookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const Ebook = mongoose.model("Ebook", EbookSchema);
export default Ebook;
