import { Expo } from "expo-server-sdk";

import config from "../config";
import { logger } from "./logger";

class NotificationService {
  expo: Expo;
  pushToken: string;

  constructor(pushToken: string) {
    this.expo = new Expo({ accessToken: config.ExpoAccessToken });
    this.pushToken = pushToken;
  }

  async sendNotification({ title, body }: { title?: string; body?: string }) {
    if (!Expo.isExpoPushToken(this.pushToken)) {
      logger.error("Push token is not a valid Expo push token");
      return;
    }

    const message = {
      to: this.pushToken,
      title,
      body,
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
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
