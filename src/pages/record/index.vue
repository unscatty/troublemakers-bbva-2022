<script setup lang="ts">
// import { defaultIOService as ioService } from '~/services/io.service'
import RecordService, {
  recordRTCDefaultOptions,
} from '~/services/record.service'
import ChatbotService from '~/services/chatbot.service'
import { toLatLngLiteral } from '../../utils/geolocation'
// import { defaultAudioContextRecorderService as contextRecorder } from '~/services/audio-context-recorder.service'

// import recorderWorkletURL from '../../worklets/recorderWorkletProcessor.js?url'
// import AudioContextRecorderService from '~/services/audio-context-recorder.service'

// import { Socket } from 'socket.io-client'

// import { io, Socket } from 'socket.io-client'

let recorder: RecordService
const recordDataURL = ref('')
const transcript = ref('')
const echoURL = ref('')
const echoAudioRef = ref<HTMLAudioElement>()
const textResponse = ref('')
const location = ref<google.maps.LatLngLiteral>()
let chatbotService: ChatbotService

const positionCallback = (position: GeolocationPosition) => {
  location.value = toLatLngLiteral(position)

  console.log('location has changed')
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionCallback, console.error)
  }
}

const startRecording = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

  recorder = new RecordService(mediaStream, recordRTCDefaultOptions)
  await recorder.startRecording()
}

const stopRecording = async () => {
  recordDataURL.value = await recorder.stopAndGetDataURL()
}

onMounted(() => {
  chatbotService = new ChatbotService()
  // ioService.onConnect(() => console.log('connected'))
  getLocation()
})

const detectIntent = async () => {
  // socket.emit('detect-intent', transcript.value)
  // const response = await ioService.emitText<DialogFlowCX.IDetectIntentResponse>(
  //   'detect-intent',
  //   transcript.value
  // )
  const response = await chatbotService.sendTextMessage(transcript.value)

  console.log(response)
  textResponse.value =
    response?.queryResult?.responseMessages?.at(0)?.text?.text?.at(0) || ''
}

const detectIntentAudio = async () => {
  // const response =
  //   await ioService.emitAudio<DialogFlowCX.IDetectIntentResponse>(
  //     'detect-intent-audio',
  //     await recorder.getBlob()
  //   )
  // console.log(response)
  // textResponse.value =
  //   response?.queryResult?.responseMessages?.at(0)?.text?.text?.at(0) || ''
}

const detectIntentAudioSynthesize = async () => {
  // const response =
  //   await ioService.emitAudio<DialogFlowCX.IDetectIntentResponse>(
  //     'detect-intent-audio-synth',
  //     await recorder.getBlob()
  //   )
  // console.log(response)
  // echoURL.value = URL.createObjectURL(
  //   new Blob([new Uint8Array(response.outputAudio as ArrayBuffer)])
  // )
}

const echoAudio = async () => {
  // const response = await ioService.echoAudio(
  //   'detect-intent-audio-echo',
  //   await recorder.getBlob()
  // )
  // console.log(response)
  // echoURL.value = URL.createObjectURL(new Blob([new Uint8Array(response)]))
}

const restartConversation = () => {
  // ioService.socketInstance.emit('reset-conversation')
}

const stopStreamingAudio = async () => {
  // await recorder.stopRecording()

  // ioService.socketInstance.emit('stop-streaming-audio')

  await chatbotService.stopStreaming()
}

const streamAudioRTC = async () => {
  // const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

  // ioService.socketInstance.on(
  //   'stream-intent-matched',
  //   (data: DialogFlowCX.IStreamingDetectIntentResponse) => {
  //     console.debug(data)
  //     const audio = data.detectIntentResponse?.outputAudio
  //     // data.detectIntentResponse.queryResult.webhookPayloads[0].fields.a.

  //     echoURL.value = URL.createObjectURL(
  //       new Blob([new Uint8Array(audio as ArrayBuffer)])
  //     )

  //     recorder.recorderInstance.pauseRecording().then(() => {
  //       ioService.socketInstance.emit('pause-streaming-audio')
  //     })

  //     if (echoAudioRef.value) {
  //       echoAudioRef.value.onended = () =>
  //         recorder.recorderInstance.resumeRecording().then(() => {
  //           ioService.socketInstance.emit('resume-streaming-audio')
  //         })
  //     }

  //     echoAudioRef.value?.play()
  //   }
  // )

  // ioService.socketInstance.emit('start-streaming-audio', {
  //   queryParams: {
  //     payload: {
  //       fields: {
  //         location: {
  //           structValue: {
  //             fields: {
  //               lat: {
  //                 numberValue: location.value?.lat,
  //               },
  //               lng: {
  //                 numberValue: location.value?.lng,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })

  // recorder = RecordService.stream(mediaStream, {
  //   ...recordRTCDefaultOptions,
  //   timeSlice: 250,
  //   ondataavailable(data) {
  //     ioService.socketInstance.emit('stream-audio-data', {
  //       queryParams: {
  //         payload: {
  //           fields: {
  //             location: {
  //               structValue: {
  //                 fields: {
  //                   lat: {
  //                     numberValue: location.value?.lat,
  //                   },
  //                   lng: {
  //                     numberValue: location.value?.lng,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       queryInput: {
  //         audio: {
  //           audio: data as unknown as Uint8Array,
  //         },
  //       },
  //     } as DialogFlowCX.IStreamingDetectIntentRequest)
  //   },
  // })

  // await recorder.startRecording()

  // New implementation
  const getStreamData = (): DialogFlowCX.IStreamingDetectIntentRequest => {
    return {
      queryParams: {
        payload: {
          fields: {
            location: {
              structValue: {
                fields: {
                  lat: {
                    numberValue: location.value?.lat,
                  },
                  lng: {
                    numberValue: location.value?.lng,
                  },
                },
              },
            },
          },
        },
      },
    }
  }

  await chatbotService.startStreamingAudio({
    initialStreamData: getStreamData(),
    streamDataWrapper: getStreamData,
    onIntentMatched: async (data) => {
      console.debug(data)
      const audio = data.detectIntentResponse?.outputAudio
      // data.detectIntentResponse.queryResult.webhookPayloads[0].fields.a.

      echoURL.value = URL.createObjectURL(
        new Blob([new Uint8Array(audio as ArrayBuffer)])
      )

      await chatbotService.pauseStreaming()

      if (echoAudioRef.value) {
        echoAudioRef.value.onended = () => {
          chatbotService.resumeStreaming()
          URL.revokeObjectURL(echoURL.value)
        }
      }

      echoAudioRef.value?.play()
    },
  })
}
</script>

<template>
  <div>
    <FlyoutMenu />
    <!-- <audio :src="recordDataURL" controls></audio> -->
    <audio
      ref="echoAudioRef"
      :src="echoURL"
      autoplay
      style="display: none"
    ></audio>
    <input v-model="transcript" type="text" />
    <span>{{ textResponse }}</span>
    <!-- <button class="btn" @click="startRecording">Start recording</button> -->
    <!-- <button class="btn" @click="stopRecording">Stop recording</button> -->
    <button class="btn" @click="detectIntent">Detect Intent</button>
    <!-- <button class="btn" @click="detectIntentAudio">Detect Intent Audio</button> -->
    <!-- <button class="btn" @click="detectIntentAudioSynthesize">
      Detect Intent Audio Synth
    </button> -->
    <!-- <button class="btn" @click="startStreamingAudio">Stream Audio</button> -->
    <button class="btn" @click="streamAudioRTC">Stream Audio</button>
    <button class="btn" @click="stopStreamingAudio">Stop Stream Audio</button>
    <button class="btn" @click="restartConversation">
      Restart Conversation
    </button>
    <!-- <button class="btn" @click="echoAudio">Echo Audio</button> -->
  </div>
</template>

<style scoped></style>
