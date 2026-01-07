import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AtGuard } from '../common/guards';

@Controller('payment')
@UseGuards(AtGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('order')
    @HttpCode(HttpStatus.OK)
    async createOrder(@Body() body: { amount: number; currency?: string }) {
        return this.paymentService.createOrder(body.amount, body.currency);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyPayment(@Body() body: { orderId: string; paymentId: string; signature: string }) {
        return this.paymentService.verifyPayment(body.orderId, body.paymentId, body.signature);
    }
}
