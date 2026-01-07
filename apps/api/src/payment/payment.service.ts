import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    private razorpay: Razorpay;

    constructor(private configService: ConfigService) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    async createOrder(amount: number, currency: string = 'INR') {
        try {
            const options = {
                amount: amount * 100, // Amount in smallest currency unit (paise)
                currency,
                receipt: `receipt_${Date.now()}`,
            };
            const order = await this.razorpay.orders.create(options);
            return order;
        } catch (error) {
            throw new InternalServerErrorException('Failed to create Razorpay order');
        }
    }

    verifyPayment(orderId: string, paymentId: string, signature: string) {
        const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        if (!secret) throw new InternalServerErrorException('Razorpay secret key not found');
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        if (generatedSignature === signature) {
            return { success: true, message: 'Payment verified successfully' };
        } else {
            throw new BadRequestException('Invalid payment signature');
        }
    }
}
