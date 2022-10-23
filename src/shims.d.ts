import {} from 'google.maps'

import { google } from '@google-cloud/dialogflow-cx/build/protos/protos'
import DialogFlowCX = google.cloud.dialogflow.cx.v3

export = DialogFlowCX
export as namespace DialogFlowCX

declare interface Window {
  // extend the window
}

// with vite-plugin-vue-markdown, markdown files can be treated as Vue components
declare module '*.md' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
