const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { registerUser, getUserByUsername } = require('C:/Users/ADMIN/Documents/workspace/node_files/authController');
const bcrypt = require('bcrypt');
const pool = require('C:/Users/ADMIN/Documents/workspace/node_files/db');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secretk', resave: true, saveUninitialized: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <div style="text-align: center; padding: 20px;">
      <h1>Login</h1>
      <form method="post" action="/login" style="max-width: 300px; margin: 0 auto;">
        <label for="username" style="display: block; margin-bottom: 10px;">Username:</label>
        <input type="text" name="username" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <label for="password" style="display: block; margin-bottom: 10px;">Password:</label>
        <input type="password" name="password" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <button type="submit" style="background-color: #4caf50; color: #fff; padding: 10px; border: none; cursor: pointer;">Login</button>
      </form>
      <p style="margin-top: 10px;">Don't have an account? <a href="/register" style="color: #4caf50; text-decoration: none;">Register</a></p>
      ${req.session.errorMessage ? `<p style="color: red;">${req.session.errorMessage}</p>` : ''}
    </div>
  `);
});

app.get('/register', (req, res) => {
  res.send(`
    <div style="text-align: center; padding: 20px;">
      <h1>Registration</h1>
      ${req.session.errorMessage ? `<p style="color: red;">${req.session.errorMessage}</p>` : ''}
      <form method="post" action="/register" style="max-width: 300px; margin: 0 auto;">
        <label for="name" style="display: block; margin-bottom: 10px;">Name:</label>
        <input type="text" name="name" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <label for="username" style="display: block; margin-bottom: 10px;">Username:</label>
        <input type="text" name="username" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <label for="password" style="display: block; margin-bottom: 10px;">Password:</label>
        <input type="password" name="password" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <label for="confirmPassword" style="display: block; margin-bottom: 10px;">Confirm Password:</label>
        <input type="password" name="confirmPassword" required style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <button type="submit" style="background-color: #4caf50; color: #fff; padding: 10px; border: none; cursor: pointer;">Register</button>
      </form>
      <p style="margin-top: 10px;">Already have an account? <a href="/" style="color: #4caf50; text-decoration: none;">Login</a></p>
    </div>
  `);
});

app.post('/register', async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      req.session.errorMessage = 'Username is already taken';
      return res.redirect('/register');
    }

    if (password.length < 8) {
      req.session.errorMessage = 'Password must have at least 8 characters';
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      req.session.errorMessage = 'Passwords do not match';
      return res.redirect('/register');
    }

    const userId = await registerUser(name, username, password);
    req.session.userId = userId;
    res.send('You are successfully registered. <a href="/" style="color: #4caf50; text-decoration: none;">Login</a>');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      req.session.errorMessage = 'Username is not registered yet';
      return res.redirect('/');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      req.session.userId = user.id;
      res.send(`Hello, ${user.name}!`);
    } else {
      req.session.errorMessage = 'Incorrect password';
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});