import RecordRTC from 'recordrtc'
import IOService, { defaultIOService } from './io.service'
import RecordService, { recordRTCDefaultOptions } from './record.service'

export default class ChatbotService {
  recorder?: RecordService
  ioService: IOService

  constructor() {
    this.ioService = defaultIOService
    this.ioService.onConnect(() => console.log('connected'))
  }

  async startStreamingAudio(
    // eslint-disable-next-line no-unused-vars
    options: {
      initialStreamData: DialogFlowCX.IDetectIntentRequest
      // eslint-disable-next-line no-unused-vars
      streamDataWrapper: (...args: any[]) => DialogFlowCX.IDetectIntentRequest
      onIntentMatched: (
        // eslint-disable-next-line no-unused-vars
        data: DialogFlowCX.IStreamingDetectIntentResponse
      ) => void
      onRecognitionResult: (
        // eslint-disable-next-line no-unused-vars
        data: DialogFlowCX.IStreamingDetectIntentResponse
      ) => void
    },
    recoderOptions: Partial<RecordRTC.Options> = { timeSlice: 250 }
  ) {
    // Ask for audio permissions
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    // Initialize recorder
    this.recorder = new RecordService(mediaStream, {
      ...recordRTCDefaultOptions,
      ...recoderOptions,
      ondataavailable: (data) => {
        this.ioService.socketInstance.emit('stream-audio-data', {
          ...options.streamDataWrapper(),
          queryInput: {
            audio: {
              audio: data as unknown as Uint8Array,
            },
          },
        } as DialogFlowCX.IStreamingDetectIntentRequest)
      },
    })

    // Setup listener when intent is matched
    this.ioService.socketInstance.on(
      'stream-intent-matched',
      options.onIntentMatched
    )

    // Setup listener when backend responds with recognition result
    this.ioService.socketInstance.on(
      'stream-recognition-result',
      options.onRecognitionResult
    )

    // Start the audio stream
    await this.recorder.startRecording()

    // Send initial request to start streaming
    this.ioService.socketInstance.emit(
      'start-streaming-audio',
      options.initialStreamData
    )
  }

  async sendTextMessage(text: string) {
    return this.ioService.emitText<DialogFlowCX.IDetectIntentResponse>(
      'detect-intent-text',
      text
    )
  }

  async detectIntent(request: DialogFlowCX.IDetectIntentRequest) {
    return this.ioService.emitIntentRequest('detect-intent', request)
  }

  async restartConversation() {
    return this.ioService.emitAsync<DialogFlowCX.IDetectIntentResponse>(
      'reset-conversation',
      ''
    )
  }

  async pauseStreaming() {
    return this.recorder?.recorderInstance?.pauseRecording()
  }

  async resumeStreaming() {
    return this.recorder?.recorderInstance?.resumeRecording()
  }

  async stopStreaming() {
    await this.recorder?.stopRecording()

    this.ioService.socketInstance.emit('stop-streaming-audio')

    // Remove listeners
    this.ioService.socketInstance.removeListener('stream-intent-matched')
    this.ioService.socketInstance.removeListener('stream-recognition-result')
  }
}

export const defaultChatbotService = new ChatbotService()
