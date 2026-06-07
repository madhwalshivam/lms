const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOne({ id });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Notification.findOneAndDelete({ id });

    if (!result) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
