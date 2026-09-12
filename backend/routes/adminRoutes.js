const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Placeholder controller functions
const getDashboard = (req, res) => {
  res.json({ message: 'Admin dashboard endpoint' });
};

const getUsers = (req, res) => {
  res.json({ message: 'Get users endpoint' });
};

const createUser = (req, res) => {
  res.json({ message: 'Create user endpoint' });
};

const updateUser = (req, res) => {
  res.json({ message: `Update user ${req.params.id}` });
};

const deleteUser = (req, res) => {
  res.json({ message: `Delete user ${req.params.id}` });
};

router.use(protect);
router.use(roleCheck('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;