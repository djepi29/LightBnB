const express = require("express");
const bcrypt = require("bcrypt");
const database = require("../db/database");

const router = express.Router();

// Create a new user
router.post("/", (req, res) => {
  const user = req.body;
  // Hash the user's password before storing it in the database
  user.password = bcrypt.hashSync(user.password, 12);
  database
    .addUser(user)
    .then((user) => {
      if (!user) {
        return res.send({ error: "error" });
      }
 // Store the user's ID in the session to maintain login state
      req.session.userId = user.id;
      res.send("🤗");
    })
    .catch((e) => res.send(e));
});

// Log a user in
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Retrieve the user from the database based on the provided email
  database.getUserWithEmail(email).then((user) => {
    if (!user) {
      return res.send({ error: "no user with that id" });
    }

     // Compare the provided password with the hashed password stored in the database
    if (!bcrypt.compareSync(password, user.password)) {
      return res.send({ error: "error" });
    }
// If the password matches, set the user ID in the session
    req.session.userId = user.id;
    // Send a success response with user information (excluding password)
    res.send({
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
      },
    });
  });
});

// Log a user out
router.post("/logout", (req, res) => {
  // Clear the user ID from the session to log them out
  req.session.userId = null;
   // Send an empty response indicating successful logout
  res.send({});
});

// Return information about the current user (based on cookie value)
router.get("/me", (req, res) => {
  // Retrieve the user ID from the session cookie
  const userId = req.session.userId;
   // Check if the user is logged in by verifying the presence of a user ID
  if (!userId) {
    // If not logged in, send a message indicating the user is not logged in
    return res.send({ message: "not logged in" });
  }

   // Fetch user data from the database using the stored user ID
  database
    .getUserWithId(userId)
    .then((user) => {
      // If no user is found with the given ID, return an error response
      if (!user) {
        return res.send({ error: "no user with that id" });
      }

       // Send a success response with user information (excluding password)
      res.send({
        user: {
          name: user.name,
          email: user.email,
          id: userId,
        },
      });
    })
    .catch((e) => res.send(e));
});

module.exports = router;
