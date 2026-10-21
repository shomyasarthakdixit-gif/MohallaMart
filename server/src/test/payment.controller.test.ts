import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { verifyPayment, handleWebhook } from '../modules/payments/payment.controller';

// Mock dependencies
jest.mock('database', () => ({
  prisma: {
    payment: {
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }
}));

import { prisma } from 'database';

// Mock paymentService
jest.mock('../modules/payments/payment.service', () => ({
  paymentService: {
    getProvider: () => ({
      verifyPayment: jest.fn().mockImplementation(async (params: any) => {
        return params.signature === 'mock_success' || params.signature.startsWith('mock_');
      }),
      verifyWebhook: jest.fn().mockImplementation((sig: any) => sig === 'valid_sig'),
      parseWebhookEvent: jest.fn().mockImplementation((body: any) => ({
        event: body.event,
        orderId: body.payload?.payment?.entity?.order_id
      }))
    })
  }
}));

const app = express();
app.use(express.json());
app.post('/api/payments/verify', verifyPayment);
app.post('/api/payments/webhook', handleWebhook);

describe('Payment Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify payment successfully and update DB', async () => {
    (prisma.payment.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post('/api/payments/verify')
      .send({
        orderIds: ['order_1'],
        razorpay_order_id: 'rzp_order_1',
        razorpay_payment_id: 'rzp_pay_1',
        razorpay_signature: 'mock_success'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { orderId: { in: ['order_1'] } },
      data: {
        status: 'SUCCESS',
        providerOrderId: 'rzp_order_1',
        providerPaymentId: 'rzp_pay_1'
      }
    });
  });

  it('should fail payment verification on invalid signature', async () => {
    (prisma.payment.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post('/api/payments/verify')
      .send({
        orderIds: ['order_2'],
        razorpay_order_id: 'rzp_order_2',
        razorpay_payment_id: 'rzp_pay_2',
        razorpay_signature: 'invalid_sig'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { orderId: { in: ['order_2'] } },
      data: { status: 'FAILED' }
    });
  });

  it('should handle webhook successfully', async () => {
    (prisma.payment.findFirst as jest.Mock<any>).mockResolvedValue({
      id: 'pay_id_1',
      status: 'PENDING'
    });
    (prisma.payment.update as jest.Mock<any>).mockResolvedValue({});

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', 'valid_sig')
      .send({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              order_id: 'rzp_order_1'
            }
          }
        }
      });

    expect(res.status).toBe(200);
    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: { providerOrderId: 'rzp_order_1' }
    });
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay_id_1' },
      data: { status: 'SUCCESS' }
    });
  });
});
