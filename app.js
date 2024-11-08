import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import flash from "connect-flash";
import routes from "./routes/routes.js";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import { check, validationResult } from "express-validator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const dbUrl = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
const pass = process.env.PASS;

// connect to db
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"));

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors());

app.use("/", routes);

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { user: req.user });
});

// contact form
app.post(
  "/send",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Invalid Email Address"),
    check("subject").notEmpty().withMessage("Subject is required"),
    check("message").notEmpty().withMessage("Message is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("dashboard", { errors: errors.mapped() });
    } else {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "okundashedrack@gmail.com",
          pass: pass,
        },
      });

      const mailOption = {
        from: req.body.email,
        to: "okundashedrack@gmail.com",
        subject: req.body.subject,
        text: req.body.message,
      };

      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          res.redirect("/dashboard");
        }
      });
    }
  },
);

app.get("/payment", (req, res) => {
  res.render("payment");
});

app.listen(port, () => {
  console.log("Server started on http://localhost:3000");
});
