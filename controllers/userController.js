import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // create a new user
    user = new User({
      username,
      email,
      password,
    });

    // hash user's password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // save a new user to the database
    await user.save();

    res.status(200).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // compare password between one provided and stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    res.status(200).json({ msg: "Login successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: {} },
      {
        $project: {
          username: 1,
          email: 1,
          role: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({
      Status: "Success",
      message: "Fetched Users!",
      users,
    });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

export const editUser = async (req, res) => {
  const userId = req.body.userId;
  const { username, email, password } = req.body;

  if (!userId) {
    return res.status(400).json({
      Status: "Failed",
      message: "User ID is required!",
    });
  }

  if (!username && !email && !password) {
    return res.status(400).json({
      Status: "Failed",
      message:
        "At least one field (username, email, password) is required for update!",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        Status: "Failed",
        message: "User not found",
      });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // save the updates to the db
    await user.save();
    res.status(200).json({
      Status: "Success",
      message: "User updated successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
