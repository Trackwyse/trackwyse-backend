import { Expo } from "expo-server-sdk";

import config from "../config";
import { logger } from "./logger";

class NotificationService {
  expo: Expo;
  pushTokens: string[];

  constructor(pushTokens: string[]) {
    this.expo = new Expo({ accessToken: config.ExpoAccessToken });
    this.pushTokens = pushTokens;
  }

  async sendNotification({ title, body, data }: { title?: string; body?: string; data?: any }) {
    if (!this.pushTokens.length) {
      logger.error("No push tokens were provided");
      return;
    }

    const messages = this.pushTokens.map((pushToken) => {
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error("Push token is not a valid Expo push token");
        return;
      }

      return {
        to: pushToken,
        title,
        body,
        data,
      };
    });

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }
    } catch (err) {
      logger.error(err);
    }
  }
}

export default NotificationService;
