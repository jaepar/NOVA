import apiClient from "../client";

export type AuthMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: null;
};

export type SignupRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  birth: string;
  gender: "MALE" | "FEMALE";
};

export const authApi = {
  signup: async (payload: SignupRequest): Promise<AuthMessageResponse> => {
    const response = await apiClient.post<AuthMessageResponse>("/auth/signup", payload);

    return response.data;
  },
  logout: async (): Promise<AuthMessageResponse> => {
    const response = await apiClient.post<AuthMessageResponse>("/auth/logout");

    return response.data;
  },
};
