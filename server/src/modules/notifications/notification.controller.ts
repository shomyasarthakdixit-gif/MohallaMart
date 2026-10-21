import { Request, Response } from "express";
import { prisma } from "database";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req.user?.id as string);
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user?.id as string);
    const notificationId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId as string }
    });

    if (!notification || notification.userId !== userId) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    await prisma.notification.update({
      where: { id: notificationId as string },
      data: { isRead: true }
    });

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req.user?.id as string);

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
