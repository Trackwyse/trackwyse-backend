import aws from "aws-sdk";

import config from "@/config";
import { logger } from "@/lib/logger";

aws.config.update({ region: config.AWSRegion });

class MailService {
  ses: aws.SES;
  from: string;
  params: any;

  constructor() {
    this.ses = new aws.SES({ apiVersion: "2010-12-01" });
    this.from = config.SenderEmail;

    this.params = {
      Destination: {
        ToAddresses: [],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: "",
          },
          Text: {
            Charset: "UTF-8",
            Data: "",
          },
        },
        Subject: {
          Charset: "UTF-8",
        },
      },
      Source: this.from,
    };
  }

  async sendVerificationEmail(to: string, token: string) {
    this.params.Destination.ToAddresses = [to];
    this.params.Message.Subject.Data = "Verify your email";

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
      Please use the following code to verify your email address:
      ${token}
    `;

    try {
      await this.ses.sendEmail(this.params).promise();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async sendResetEmail(to: string, token: string) {
    this.params.Destination.ToAddresses = [to];
    this.params.Message.Subject.Data = "Reset your password";

    this.params.Message.Body.Html.Data = `
      <html>
        <body>
          <h1>Reset your password</h1>
          <p>Please use the following code to reset your password:</p>
          <p>${token}</p>
        </body>
      </html>
    `;

    this.params.Message.Body.Text.Data = `
      Reset your password
      Please use the following code to reset your password:
      ${token}
    `;

    try {
      await this.ses.sendEmail(this.params).promise();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

const mailService = new MailService();

export default mailService;
