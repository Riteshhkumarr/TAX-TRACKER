const Notification = require('../models/Notification');

// ─── Get Notifications ─────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: req.user._id, isRead: false })
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Mark As Read ──────────────────────────────────────────────────────────
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support marking all as read
    if (id === 'all') {
      await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, message: 'Notification marked as read.', data: notification });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Notification ───────────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};
