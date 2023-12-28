const bcrypt = require('bcrypt');
const pool = require('C:/Users/ADMIN/Documents/workspace/node_files/db');

const registerUser = async (name, username, password) => {
  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING id',
      [name, username, hashedPassword]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

module.exports = { registerUser, getUserByUsername };