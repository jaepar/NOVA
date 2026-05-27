import apiClient from "../client";

type AuthApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type AuthMessageResponse = AuthApiResponse<null>;

export type SignupRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  birth: string;
  gender: "MALE" | "FEMALE";
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
};

export type SessionCheckResponse = {
  userId: number;
};

export const authApi = {
  signup: async (payload: SignupRequest): Promise<AuthMessageResponse> => {
    const response = await apiClient.post<AuthMessageResponse>("/auth/signup", payload);

    return response.data;
  },
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<AuthApiResponse<LoginResponse>>("/auth/login", payload);

    return response.data.data;
  },
  me: async (): Promise<SessionCheckResponse> => {
    const response = await apiClient.get<AuthApiResponse<SessionCheckResponse>>("/auth/me");

    return response.data.data;
  },
};
