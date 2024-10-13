const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  await User.create({ username, password: hashedPassword, role });
  res.send({ message: 'User registered' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(400).send({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, 'yourSecretKey', {
    expiresIn: 86400,
  });
  res.send({ auth: true, token });
};
