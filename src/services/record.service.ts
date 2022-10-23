import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc'

export default class RecordService {
  recorder: RecordRTCPromisesHandler

  constructor(...args: ConstructorParameters<typeof RecordRTCPromisesHandler>) {
    this.recorder = new RecordRTCPromisesHandler(...args)
  }

  static stream(
    ...args: ConstructorParameters<typeof RecordRTCPromisesHandler>
  ) {
    return new this(...args)
  }

  get recorderInstance() {
    return this.recorder
  }

  async startRecording() {
    return this.recorder.startRecording()
  }

  async stopRecording() {
    return this.recorder.stopRecording()
  }

  async reset() {
    return this.recorder.reset()
  }

  async getBuffer() {
    return Buffer.from(await this.getDataURL(), 'base64')
  }

  async getBlob() {
    return this.recorder.getBlob()
  }

  async getDataURL() {
    return this.recorder.getDataURL()
  }

  private async stopAndGet<T>(
    func: () => T,
    reset = false,
    ...funcArgs: never[]
  ) {
    await this.stopRecording()
    const data = func.bind(this, ...funcArgs)()

    if (reset) {
      this.reset()
    }

    return data
  }

  async stopAndGetBuffer(reset = false) {
    return this.stopAndGet(this.getBuffer, reset)
  }

  async stopAndGetBlob(reset = false) {
    return this.stopAndGet(this.getBlob, reset)
  }

  async stopAndGetDataURL(reset = false) {
    return this.stopAndGet(this.getDataURL, reset)
  }
}

const ENV = import.meta.env

export const recordRTCDefaultOptions: RecordRTC.Options = {
  type: 'audio',
  mimeType: 'audio/webm',
  sampleRate: ENV.VITE_RECORDER_SAMPLE_RATE,
  desiredSampRate: ENV.VITE_RECORDER_DESIRED_SAMPLE_RATE,
  recorderType: RecordRTC.StereoAudioRecorder,
  numberOfAudioChannels: 1,
}
