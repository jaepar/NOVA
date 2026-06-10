import apiClient from "../client";

type UserApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type NotificationType =
  | "SUPPLEMENT_DOCUMENT"
  | "RESIDENCE_CARD_PERIOD"
  | "CERTIFICATE_ISSUED";

export type NotificationResponse = {
  notificationId: number;
  type: NotificationType;
  content: string;
  createdAt: string;
};

export const userApi = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<
      UserApiResponse<NotificationResponse[]>
    >("/users/notifications");

    return response.data.data;
  },
};
