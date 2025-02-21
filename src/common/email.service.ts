import { HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { BaseService, logger } from '../common';
import { ServiceResponse } from '../common/interfaces';
import { config } from './config';
import Mail = require('nodemailer/lib/mailer');

// Register handlebars helpers
Handlebars.registerHelper('currentYear', function () {
  return new Date().getFullYear();
});
Handlebars.registerHelper('uuid', function () {
  return uuid();
});

@Injectable()
export class EmailService extends BaseService {
  async sendEmail({
    to,
    subject,
    html = null,
    fromEmail = '',
    fromName = '',
    template,
    template_data = {},
  }: {
    to: { email: string }[];
    subject: string;
    html?: string;
    fromEmail?: string;
    fromName?: string;
    template?:
      | 'complete-off-ramp'
      | 'complete-on-ramp'
      | 'crypto-payment'
      | 'payment-received'
      | 'verify-email'
      | 'welcome';
    template_data?: any;
  }): Promise<ServiceResponse> {
    try {
      if (!html && template) {
        const file_name = path.resolve(
          __dirname,
          '..',
          'common',
          'emails',
          `${template}.html`,
        );
        const html_file = fs.readFileSync(file_name, 'utf8');
        const handlebar_template = Handlebars.compile(html_file);
        html = handlebar_template(template_data);
      }

      return this.sendEmailNodemailer({
        to,
        subject,
        html,
        fromEmail,
        fromName,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async sendEmailNodemailer({
    to,
    subject,
    html = null,
    fromEmail = '',
    fromName = '',
  }: {
    to: { email: string }[];
    subject: string;
    html?: string;
    fromEmail?: string;
    fromName?: string;
  }) {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      SMTP_SECURE,
      EMAIL_FROM,
      EMAIL_NAME,
    } = config;

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });
      const from = `${fromName || EMAIL_NAME} <${fromEmail || EMAIL_FROM}>`;

      const mailOptions: Mail.Options = {
        from,
        to: to.map(({ email }) => email).join(', '),
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);

      if (!info.messageId) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Email could not be sent'],
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: ['Email Queued'],
      };
    } catch (error) {
      logger.error('Email error:', error);
      return this.handleError(error);
    }
  }
}
