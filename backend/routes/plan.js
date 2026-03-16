const express = require('express');
const router = express.Router();
const Plan = require('../models/plans');

router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching plans' });
  }
});

module.exports = router;