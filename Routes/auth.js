const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User } = require("../Models/User");
const jwt = require('jsonwebtoken');


router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).send({ message: "Invalid Email or Password" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send({ message: "Invalid Email or Password" });

    const user1 = await User.findOne({ email: req.body.email });
    if (user1.status==="pending" && user1.isadmin===false) return res.status(401).send({ message: "wait until admin accept you" });
    // You might want to use JWT for token generation and authentication
    const token = generateAuthToken(user._id);

    res.status(200).send({ token, message: "Logged in successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});



router.get("/all", async (req, res) => {
  try {
    const users = await User.find({ status: "pending", isadmin: false });

    res.status(200).send({ users, message: "Users with pending status fetched successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});


// Assuming you have your existing imports and setup

router.put("/approve/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    user.status = "approved"; // Update user status to "approved"
    await user.save();

    res.status(200).send({ message: "User status has been approved." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
		const salt = await bcrypt.genSalt(Number(process.env.SALT));

    const updatedUserData = req.body;
    updatedUserData.password = await bcrypt.hash(req.body.password, salt);
    const updatedUser1 = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

    if (!updatedUser1) {
      return res.status(500).json({ message: "Error updating user." });
    }

    res.status(200).json({ message: "User data has been updated.", user: updatedUser1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




router.delete("/approve/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const deleteResult = await User.deleteOne({ _id: userId });

    if (deleteResult.deletedCount === 1) {
      res.status(200).send({ message: "User has been deleted." });
    } else {
      res.status(404).send({ message: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;





const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

// You need to implement this function for token generation
function generateAuthToken(userId) {
  const payload = {
    userId: userId,
  };
  const secretKey = process.env.secretKey
  const token = jwt.sign(payload, secretKey);
  return token 
  

}




const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.secretKey);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token." });
  }
};

// Example usage of the authentication middleware
router.get("/profile", authenticateUser, (req, res) => {
  const user = req.user;
  res.status(200).json({ user });
});

module.exports = router;
