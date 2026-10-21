import { logger } from "../../utils/logger";

export const emailService = {
  sendOrderConfirmation: async (toEmail: string, orderId: string, amount: number) => {
    logger.info(`[Email Service] Mock sending Order Confirmation to ${toEmail}`);
    logger.info(`[Email Service] Order ID: ${orderId} | Total: ₹${amount}`);
    // In production, configure nodemailer with SMTP credentials:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});
    return true;
  },

  sendOrderStatusUpdate: async (toEmail: string, orderId: string, status: string) => {
    logger.info(`[Email Service] Mock sending Status Update to ${toEmail}`);
    logger.info(`[Email Service] Order ID: ${orderId} is now ${status}`);
    return true;
  }
};
