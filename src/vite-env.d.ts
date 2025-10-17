/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRO_PLAY_STORE_URL: string
  readonly VITE_PRO_MS_STORE_URL: string
  readonly VITE_PRO_WEB_URL: string
  readonly VITE_PRO_PRICE: string
  readonly VITE_PRO_CURRENCY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}