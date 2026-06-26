/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** Base URL for the AI medical chatbot — e.g. http://<PUBLIC_IP>:8000 */
  readonly VITE_CHATBOT_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
