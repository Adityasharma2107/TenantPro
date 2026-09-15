import type { RequestHandler } from 'express';
import mongoose, { Types } from 'mongoose';
import { Notification, type INotification } from '../models/Notification.model.js';
import { emitNotification } from '../socket.js';

// Helper to create and broadcast a notification
export const sendNotification = async (params: {
  recipient: Types.ObjectId | string;
  actor?: Types.ObjectId | string;
  ticket?: Types.ObjectId | string;
  type: INotification['type'];
  title: string;
  message: string;
}) => {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }
  try {
    const doc = await Notification.create({
      recipient: new Types.ObjectId(params.recipient),
      actor: params.actor ? new Types.ObjectId(params.actor) : undefined,
      ticket: params.ticket ? new Types.ObjectId(params.ticket) : undefined,
      type: params.type,
      title: params.title,
      message: params.message,
      read: false,
    });

    const populated = await Notification.findById(doc._id)
      .populate('actor', 'name email role')
      .populate('ticket', 'title location status priority');

    emitNotification(params.recipient.toString(), populated);
    return populated;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Lists recent notifications and unread count for current user
export const listNotifications: RequestHandler = async (request, response) => {
  const userId = request.user!.userId;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('actor', 'name email role')
      .populate('ticket', 'title location status priority'),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  return response.status(200).json({
    notifications,
    unreadCount,
  });
};

// Marks a single notification as read
export const markNotificationRead: RequestHandler = async (request, response) => {
  const userId = request.user!.userId;
  const { id } = request.params;

  const updated = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { read: true },
    { new: true },
  );

  if (!updated) {
    return response.status(404).json({ message: 'Notification not found.' });
  }

  const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

  return response.status(200).json({
    notification: updated,
    unreadCount,
  });
};

// Marks all notifications for current user as read
export const markAllNotificationsRead: RequestHandler = async (request, response) => {
  const userId = request.user!.userId;

  await Notification.updateMany({ recipient: userId, read: false }, { read: true });

  return response.status(200).json({
    message: 'All notifications marked as read.',
    unreadCount: 0,
  });
};
