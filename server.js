const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const port = 3000;

// DATABASE LINKING....................................
const url =
  'mongodb+srv://MJvaghasiya:1911221310%40aA@cluster0.zye0zci.mongodb.net/MJ';

// SERVE THE HTML FILES................................
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CREATE A SCHEMA FOR DATA............................
const dataSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // HASHED PASSWORD STORED IN DB
});

// CREATE A MODEL FOR DATA...............................
const Data = mongoose.model('Data', dataSchema);

// CONNECTING TO DATABASE................................
mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to the database');

    // POST METHOD............................................
    app.post('/register-form', async (req, res) => {
      const { name, email, password } = req.body;

      try {
        // CHECK IF ALREADY USER REGISTERED...........................
        const existingUser = await Data.findOne({
          $or: [{ name }, { email }],
        });
        if (existingUser) {
          // User already exists, redirect with an error message
          return res.redirect('/register.html?error=User already exists');
        }

        // HASH THE PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // CREATE A NEW USER
        const newUser = new Data({ name, email, password: hashedPassword });
        await newUser.save();

        return res.redirect('/login.html');
      } catch (error) {
        console.error('Failed to register user:', error);
        return res.redirect('/error.html');
      }
    });

    // Login route
    app.post('/login-form', async (req, res) => {
      // Add logic for user login here
      // ...
      return res.redirect('/dashboard.html');
    });

    // SERVER LINKING.......................................
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to database', err);
  });
