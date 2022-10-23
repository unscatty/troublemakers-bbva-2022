import { io, Socket } from 'socket.io-client'
// import * as ss from '~/libs/node-socketio-stream'

// Service used to comunicate with server via Socket.io
export default class IOService {
  socket: Socket

  constructor(...args: Parameters<typeof io>) {
    this.socket = io(...args)
  }

  onConnect(listener: () => void) {
    this.socket.on('connect', listener)

    // this.socket.on('detected-intent', (data) => console.log(data))
  }

  get socketInstance() {
    return this.socket
  }

  emitBinaryStream(event: string, blob: Blob) {
    this.socket.emit(event, blob)
  }

  async emitAsync<ResponseType>(...args: Parameters<InstanceType<typeof Socket>['emit']>) {
    return new Promise<ResponseType>((resolve, reject) => {
      try {
        this.socket.emit(args[0], ...args.slice(1), (response: ResponseType) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async emitIntentRequest(
    event: string,
    request: DialogFlowCX.IDetectIntentRequest
  ) {
    return this.emitAsync<DialogFlowCX.IDetectIntentResponse>(event, request)
  }

  async emitText<T>(event: string, text: string) {
    return this.emitAsync<T>(event, text)
  }

  async emitAudio<T>(event: string, audioData: Blob) {
    return this.emitAsync<T>(event, audioData)
  }

  async echoAudio(event: string, audio: Blob) {
    return this.emitAsync<ArrayBuffer>(event, audio)
  }
}

export const defaultIOService = new IOService(
  import.meta.env.VITE_SERVER_SOCKET_ENDPOINT,
  {
    extraHeaders: {
      'Bypass-Tunnel-Reminder': 'true',
    },
    // withCredentials: true,
  }
)
