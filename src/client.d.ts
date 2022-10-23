/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string

  // RecordRTC recorder
  readonly VITE_RECORDER_MIME_TYPE: string
  readonly VITE_RECORDER_SAMPLE_RATE: number
  readonly VITE_RECORDER_DESIRED_SAMPLE_RATE: number
  readonly VITE_RECORDER_AUDIO_CHANNELS: number

  // DialogFlow audio encoding
  readonly VITE_DIALOGFLOW_AUDIO_ENCODING: string
  readonly VITE_DIALOGFLOW_AUDIO_SAMPLE_RATE: number
  readonly VITE_DIALOGFLOW_LANGUAGE_CODE: string

  // Server
  readonly VITE_SERVER_ENDPOINT: string
  readonly VITE_SERVER_SOCKET_ENDPOINT: string

  // Firebase config
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
