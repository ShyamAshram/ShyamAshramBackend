const express = require('express');
const router = express.Router();

const Notification = require('../models/notification');
const { authenticateToken } = require('../middleware/admin');


router.get('/me', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  const notification = new Notification({
    title: req.body.title,
    description: req.body.description,
    date: new Date(),
    userId: req.user.id 
  });

  try {
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      console.error(`Notification with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Notification not found' });
    }

    
    if (notification.userId.toString() !== req.user.id) {
      console.error(`User ${req.user.id} does not have permission to delete notification with ID ${req.params.id}`);
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(`Error deleting notification with ID ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
