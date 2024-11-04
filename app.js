import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import jwt from "jsonwebtoken";
import passport from "./passportConfig.js";
import { isAuthenticated, isAdmin } from "./middlewares/auth.js";
import User from "./models/User.js";
import routes from "./routes/routes.js";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
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
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/", routes);

const jwtSecret = process.env.JWT_SECRET;

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

// set JWT as cookie
app.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    req.login(user, async (err) => {
      if (err) {
        return next(err);
      }

      const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "30d" });

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// middleware to verify JWT from cookies
const verifyToken = (req, res, next) => {
  const token =
    req.cookies.authToken || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({ username, password, role: "user", email });
  await newUser.save();
  res.redirect("/login");
});

app.get("/dashboard", verifyToken, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/logout", (req, res) => {
  res.clearCookie("authToken"); //clear the JWT cookie on logout
  res.redirect("/login");
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

app.listen(port, () => {
  console.log("Server started on http://localhost:3000");
});
