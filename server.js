const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const port = 3000;

// DATABASE LINKING....................................
const url = 'mongodb+srv://MJvaghasiya:1911221310%40aA@cluster0.zye0zci.mongodb.net';
const dbname = 'MJ';


// SERVE THE HTML FILES................................
app.use(express.static('public'));
app.use(bodyParser.json());
// PARSE URL-ENCODED BODIES
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.urlencoded({extended:true}));



// CREATE A SCHEMA FOR DATA............................
const dataSchema = new mongoose.Schema({
    name : String,
    email :String ,
    password : String   // HASHED PASSWORD STORED IN DB
});


// CREATE A MODEL FOR DATA...............................
const Data = mongoose.model('Data', dataSchema);

app.get('/login', (req, res) => {
    res.redirect('login.html');
  });

// CONNECTING TO DATABASE................................
mongoose.connect(`${url}/${dbname}`,{useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('connected to the databse');

// POST METHOD............................................
app.post('/register-form', async(req, res) => {
    const {name, email, password} = req.body;

    try{
// CHECK IF ALREADY USER REGISTER...........................
const existingUser = await Data.findOne({or: [{name}, {email}] });
if (existingUser) {
    return res.render('register', {error: ''})
}
// HASH THE PASSWORD
const hashedPassword = await bcrypt.hash(password, 10);

// CREATE A NEW USER
const newUser = new Data({name, email, password: hashedPassword});
await newUser.save();



return res.redirect('/login.html');
    }
    catch (error) {
        console.error('Failed to register user:', error);
        return res.redirect('/error.html');
      }
});
// Login route
app.get('/login', (req, res) => {
    return res.redirect('/dashboard.html');
  });

// SERVER LINKING.......................................
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
})
.catch (err => {
    console.error('Error connecting to database', err);
})
