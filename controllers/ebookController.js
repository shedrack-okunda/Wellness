import axios from "axios";
import Transaction from "../models/transaction.js";

let token;

export const createToken = async (req, res, next) => {
  console.log("req.body");
  console.log(req.body);
  try {
    const secret =
      "qc7A6pQJn5dNqmuFPw6vY4deTlLgeWWClDcLPQ7MVCUvGdOuLqVJDNoeAQ2HxORh";

    const consumer = "5BEIhJ3Q8SWYohAMvEDlTxsu8gqGDJuOxaWAAaAhTkWAXN8y";
    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    if (response) {
      token = response.data.access_token;
      next();
    } else {
      res.status(500).json({
        Status: "Failed",
        message: "Could not get access token",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
};

export const stkPush = async (req, res) => {
  const shortCode = 174379;
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  const name = req.body.name;
  const address = req.body.address;

  if (!phone || !name || !address) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const passkey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64",
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: 174379,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://mydomain.com/path",
    AccountReference: "Mpesa Test",
    TransactionDesc: "Testing stk push",
  };

  const transaction = new Transaction({
    name,
    address,
    phone: `254${phone}`,
    amount,
    timestamp: date,
  });

  try {
    const response = await await axios.post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    transaction.status = "Pending";
    await transaction.save();
    res.status(200).json({
      message: "Payment request sent successfully.",
      data: response.data,
    });
  } catch (err) {
    console.log("Error sending STK push:", err);

    transaction.status = "Failed";
    await transaction.save();
    res.status(400).json({ error: "Failed to process payment." });
  }
};
