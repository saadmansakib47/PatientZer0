const express = require('express');
const cors = require('cors'); // Import the cors package
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
app.use(cors()); // Enable CORS for all requests
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});
