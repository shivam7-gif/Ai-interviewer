// App configuration – all environment variables in one place
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export const APP_NAME = "InterviewOS AI";
