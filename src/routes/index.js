const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const peopleRoutes = require('./people.routes');
const locationRoutes = require('./location.routes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/people', peopleRoutes);
router.use('/location', locationRoutes);

module.exports = router;
