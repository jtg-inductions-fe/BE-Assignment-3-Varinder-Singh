import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
    private readonly transporter: Transporter;

    constructor() {
        this.transporter = createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_USER_PASSWORD,
            },
        });
    }

    async sendMail(mailOptions: Mail.Options): Promise<void> {
        await this.transporter.sendMail(mailOptions);
    }
}
