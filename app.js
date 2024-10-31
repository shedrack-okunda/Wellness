import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import passport from "./passportConfig.js";
import { isAuthenticated, isAdmin } from "./middlewares/auth.js";
import User from "./models/User.js";
import routes from "./routes/routes.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// connect to db
mongoose
  .connect(
    "mongodb+srv://okundashedrack:7uIV2r40v8YtBLYW@cluster0.sn33f.mongodb.net/wellness?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
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

app.use("/", routes);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({ username, password, role: "user", email });
  await newUser.save();
  res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
