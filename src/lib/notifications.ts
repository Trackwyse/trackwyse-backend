import { Expo } from "expo-server-sdk";

import config from "../config";
import { logger } from "./logger";

class NotificationService {
  expo: Expo;

  constructor() {
    this.expo = new Expo({ accessToken: config.ExpoAccessToken });
  }

  async sendNotification(
    pushTokens: string[],
    { title, body, data }: { title?: string; body?: string; data?: any }
  ) {
    if (!pushTokens.length) {
      logger.error("No push tokens were provided");
      return;
    }

    const messages = pushTokens.map((pushToken) => {
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

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    try {
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }
    } catch (err) {
      logger.error(err);
    }
  }
}

const notificationService = new NotificationService();

export default notificationService;
