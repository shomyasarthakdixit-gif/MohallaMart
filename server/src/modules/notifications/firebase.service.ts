import { logger } from "../../utils/logger";

export const pushNotificationService = {
  sendPushNotification: async (fcmToken: string, title: string, body: string, data?: any) => {
    logger.info(`[Push Service] Mock sending Push Notification to ${fcmToken}`);
    logger.info(`[Push Service] Title: ${title} | Body: ${body}`);
    // In production, configure Firebase Admin SDK:
    // const message = { notification: { title, body }, token: fcmToken, data };
    // await admin.messaging().send(message);
    return true;
  }
};
