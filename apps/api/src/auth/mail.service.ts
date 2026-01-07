import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private config: ConfigService) {
        const port = Number(this.config.get('SMTP_PORT'));
        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST'),
            port: port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASS'),
            },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const url = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;

        await this.transporter.sendMail({
            from: `"RexCoders Automation" <${this.config.get('SMTP_USER')}>`,
            to: email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to RexCoders Automation!</h2>
                    <p>Please click the button below to verify your email address:</p>
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>${url}</p>
                </div>
            `,
        });
    }
}
