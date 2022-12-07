import aws from 'aws-sdk';
import config from '../config';
import { logger } from './logger';

aws.config.update({ region: config.AWSRegion });

class MailService {
  ses: aws.SES;
  from: string;
  to: string;
  subject: string;
  params: any;

  constructor(to: string, subject: string) {
    this.ses = new aws.SES({ apiVersion: '2010-12-01' });

    this.to = to;
    this.subject = subject;
    this.from = config.SenderEmail;

    this.params = {
      Destination: {
        ToAddresses: [this.to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: '',
          },
          Text: {
            Charset: 'UTF-8',
            Data: '',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: this.subject,
        },
      },
      Source: this.from,
    };
  }

  async sendVerificationEmail(token: string) {
    this.params.Message.Body.Html.Data = `
      <html>
        <body>
          <h1>Verify your email</h1>
          <p>Please use the following code to verify your email address:</p>
          <p>${token}</p>
        </body>
      </html>
    `;

    this.params.Message.Body.Text.Data = `
      Verify your email
      Please use the following link to verify your email address:
      ${token}
    `;

    try {
      const data = await this.ses.sendEmail(this.params).promise();

      logger.info(data);
    } catch (err) {
      logger.error(err);
    }
  }
}

export default MailService;
