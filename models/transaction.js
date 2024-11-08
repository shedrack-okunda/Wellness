import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
