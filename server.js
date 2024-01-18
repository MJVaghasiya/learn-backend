const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const port = 3000;

// DATABASE LINKING....................................
const url = 'mongodb+srv://maulikvaghasiya:1911221310%40aA@cluster0.iheb411.mongodb.net';
const dbname = 'MJ';

// SERVE THE HTML FILES................................
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

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
    .connect(`${url}/${dbname}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to the database');

        // POST METHOD............................................
        app.post('/register-form', async (req, res) => {
            const { username, email, password } = req.body;

            try {
                // CHECK IF ALREADY USER REGISTER...........................
                const existingUser = await Data.findOne({ $or: [{ username }, { email }] });
                if (existingUser) {
                    return res.render('register', { error: '' });
                }
                // HASH THE PASSWORD
                const hashedPassword = await bcrypt.hash(password, 10);

                // CREATE A NEW USER
                const newUser = new Data({ username, email, password: hashedPassword });
                await newUser.save();

                return res.redirect('/login.html');
            } catch (error) {
                console.error('Failed to register user:', error);
                return res.redirect('/error.html');
            }
        });



        // Login route
        app.post('/login', (req, res) => {
            // Perform authentication logic here
            // If authentication is successful, redirect to dashboard.html
            // Otherwise, redirect back to login.html with an error message
            const { username, password } = req.body;
            // Implement your authentication logic here

            // For now, let's assume authentication is successful
            return res.redirect('/dashboard.html');
        });


        // FOR FORGOT-PASSWORD START
        // Reset password route
        app.post('/reset-password', async (req, res) => {
            const { email, resetCode, newPassword } = req.body;

            try {
                // Find the user with the provided email and reset code
                const user = await Data.findOne({ email, resetCode });

                if (!user) {
                    // Invalid reset code or email, you can handle this case accordingly (e.g., show an error message)
                    return res.render('reset-password', { error: 'Invalid reset code or email' });
                }

                // Hash the new password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Update the user's password and clear the reset code
                user.password = hashedPassword;
                user.resetCode = undefined;
                await user.save();

                // Password reset successful, redirect to the login page
                return res.redirect('/login.html');
            } catch (error) {
                console.error('Error resetting password:', error);
                return res.redirect('/login.html');
            }
        });
        // FOR FORGOT-PASSWORD END
        // SERVER LINKING.......................................
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to the database', err);
    });
