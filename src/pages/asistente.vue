<script setup lang="ts">
import {
  ChatbotGroup,
  ReplyGroup,
  UserGroup,
} from '~/models/chatbot/messages/helper-types'
import ChatbotReplyMessage from '~/models/chatbot/messages/reply-message'
import ChatbotUserMessage from '~/models/chatbot/messages/user-message'
import { defaultChatbotService as chatbotService } from '~/services/chatbot.service'
import { toLatLngLiteral } from '../utils/geolocation'

const userInput = ref('')
const placeholder = 'Escribe un mensaje'
const defaultUserImage =
  'https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144'
const defaultBotImage =
  '/chatbot-icon.png'

const chatMessages = ref<Array<UserGroup | ReplyGroup>>([])

const messagesLength = computed(() => chatMessages.value.length)

const location = ref<google.maps.LatLngLiteral>()

// Variables for streaming
const isStreaming = ref(false)
// The audio element to playback the audio response
const echoURL = ref('')
const echoAudioRef = ref<HTMLAudioElement>()

// The panel where messages are displayed
// This is used to auto-scroll the panel if overflown
const messagesPanelRef = ref<HTMLElement>()

onMounted(() => {
  getLocation()

  createBotReplies([{
    text: {
      text: ['¡Hola! Soy el asistente de ATMs de BBVA, puedo ayudarte a buscar un cajero cerca de donde estés.']
    }
  }])
})

// Auto scroll messages
watch(chatMessages.value, () => {
  if (messagesPanelRef && messagesPanelRef.value) {
    messagesPanelRef.value.scrollTop = 99_999_999
  }
})

// Reset the bot conversation
const resetConversation = async () => {
  const response = await chatbotService.restartConversation()

  console.debug(response)

  createBotReplies(response?.queryResult?.responseMessages)
}

// Stream audio to backend
const startStreamingAudio = async () => {
  // Set the structure for the data sent to backend
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

  // Start the audio stream
  await chatbotService.startStreamingAudio({
    initialStreamData: getStreamData(),
    streamDataWrapper: getStreamData,
    onIntentMatched: async (data) => {
      console.debug('Intent matched:')
      console.debug(data)

      // Show response as bot reply
      createBotReplies(data.detectIntentResponse?.queryResult?.responseMessages)

      const audio = data.detectIntentResponse?.outputAudio
      // data.detectIntentResponse.queryResult.webhookPayloads[0].fields.a.

      echoURL.value = URL.createObjectURL(
        new Blob([new Uint8Array(audio as ArrayBuffer)])
      )

      // Pause recording so audio is not streamed twice
      await chatbotService.pauseStreaming()

      // Resume recording when audio finishes playing
      if (echoAudioRef.value) {
        echoAudioRef.value.onended = () => {
          chatbotService.resumeStreaming()
          URL.revokeObjectURL(echoURL.value)
        }
      }

      echoAudioRef.value?.play()
    },
    onRecognitionResult: async (data) => {
      console.debug('Recognition result:')
      console.debug(data)

      // Show recognition result as user message
      addTranscript(data.recognitionResult!)
    },
  })

  isStreaming.value = true
}

// Add recognitions result transcript as a user message
const addTranscript = (
  recognitionResult: DialogFlowCX.IStreamingRecognitionResult
) => {
  const lastMessageGroup = chatMessages.value.at(-1)

  if (
    !lastMessageGroup ||
    lastMessageGroup.kind === ChatbotGroup.CHATBOT_REPLIES
  ) {
    // Insert new message
    const userMessageGroup: UserGroup = {
      kind: ChatbotGroup.USER_MESSAGES,
      messages: [
        {
          text: recognitionResult.transcript!,
          timestamp: new Date(),
        },
      ],
    }

    chatMessages.value.push(userMessageGroup)
  } else if (lastMessageGroup.kind === ChatbotGroup.USER_MESSAGES) {
    // Change last message sent by user
    const lastUserMessage =
      lastMessageGroup.messages[lastMessageGroup.messages.length - 1]

    lastUserMessage.text = recognitionResult.transcript!
  }
}

const stopStreamingAudio = async () => {
  await chatbotService.stopStreaming()

  isStreaming.value = false
}

const toggleStreamingAudio = async () => {
  if (isStreaming.value) {
    await stopStreamingAudio()
  } else {
    await startStreamingAudio()
  }
}

const positionCallback = (position: GeolocationPosition) => {
  location.value = toLatLngLiteral(position)

  console.log('location has changed')
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionCallback, console.error)
  }
}

const createUserMessage = (text: string) => {
  addUserMessage({
    text,
    timestamp: new Date(),
  })
}

const createBotReplies = (
  messages: DialogFlowCX.IResponseMessage[] | null | undefined
) => {
  if (!messages) return

  // Create a new chatbot reply group with responses
  const botReplies = messages
    .map((message): ChatbotReplyMessage | undefined => {
      if (message?.text?.text) {
        return {
          text: message.text?.text?.join('\n'),
          timestamp: new Date(),
        }
      }

      // Payload message
      if (message?.payload) {
        const mapImageSrc = message?.payload?.fields?.mapImageSrc?.stringValue

        if (mapImageSrc) {
          return {
            mapImageSrc,
            timestamp: new Date(),
          }
        }
      }
    })
    .filter(Boolean)

  // Add group to messages
  const lastMessage = chatMessages.value[messagesLength.value - 1]

  // There are no messages or last message is message from user
  if (!lastMessage || lastMessage.kind === ChatbotGroup.USER_MESSAGES) {
    // Create new chatbot reply group
    const newBotReplyGroup: ReplyGroup = {
      kind: ChatbotGroup.CHATBOT_REPLIES,
      // falsy values already removed
      messages: botReplies as ChatbotReplyMessage[],
    }
    // Push new message group to messages array
    chatMessages.value.push(newBotReplyGroup)

    return
  }

  if (lastMessage.kind === ChatbotGroup.CHATBOT_REPLIES) {
    // Push messages to existing group
    lastMessage.messages.push(...(botReplies as ChatbotReplyMessage[]))
  }
}

const detectInputText = async () => {
  const userTextInput = userInput.value

  if (!userTextInput) return

  createUserMessage(userTextInput)

  userInput.value = ''

  const detectRequest: DialogFlowCX.IDetectIntentRequest = {
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
    queryInput: {
      text: {
        text: userTextInput,
      },
    },
  }

  const response = await chatbotService.detectIntent(detectRequest)

  console.debug(response)

  createBotReplies(response?.queryResult?.responseMessages)
}

const addUserMessage = (message: ChatbotUserMessage) => {
  const lastMessage = chatMessages.value[messagesLength.value - 1]

  // There are no messages or last message is reply from bot
  if (!lastMessage || lastMessage.kind === ChatbotGroup.CHATBOT_REPLIES) {
    // Create user message group
    const newUserMessageGroup: ChatbotUserMessage[] = [message]

    // Push new message group to messages array
    chatMessages.value.push({
      kind: ChatbotGroup.USER_MESSAGES,
      messages: newUserMessageGroup,
    })

    return
  }

  if (lastMessage.kind === ChatbotGroup.USER_MESSAGES) {
    // Push new message to message group
    lastMessage.messages.push(message)
  }
}
</script>

<template>
  <!-- The audio element where the response will get played -->
  <audio ref="echoAudioRef" :src="echoURL" class="hidden" autoplay />
  <div class="flex-1 sm:p-6 justify-between flex flex-col h-screen">
    <FlyoutMenu />
    <div
      class="flex sm:items-center justify-between py-3 border-b-2 border-gray-200"
    >
      <div class="relative flex items-center space-x-4">
        <div class="relative">
          <span
            class="absolute text-green-500 right-0 bottom-0 text-xs lg:text-base"
          >
            <div class="i-mdi-checkbox-blank-circle" />
          </span>
          <img
            :src="defaultBotImage"
            alt=""
            class="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
          />
        </div>
        <div class="flex flex-col leading-tight">
          <div class="text-2xl mt-1 flex items-center">
            <span class="text-gray-700 mr-3">Asistente ATM</span>
          </div>
          <span class="text-lg text-gray-600">BBVA bot</span>
        </div>
      </div>
      <!-- Icons -->
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <!-- Restart conversation when pressing this button -->
          <div
            class="i-heroicons-arrow-path text-xl"
            @click="resetConversation"
          />
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <div class="i-mdi-crosshairs-gps text-xl" @click="getLocation"></div>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <!-- <Messages> -->
    <div
      ref="messagesPanelRef"
      class="scrolling-touch flex flex-col space-y-4 p-3 max-h-full overflow-y-scroll mt-auto"
    >
      <template v-for="(messageGroup, index) in chatMessages" :key="index">
        <UserMessageGroup
          v-if="messageGroup.kind === ChatbotGroup.USER_MESSAGES"
          :messages="messageGroup.messages"
          :img-src="defaultUserImage"
        />
        <ReplyMessageGroup
          v-if="messageGroup.kind === ChatbotGroup.CHATBOT_REPLIES"
          :messages="messageGroup.messages"
          :img-src="defaultBotImage"
        />
      </template>
    </div>
    <!-- <Messages /> -->
    <!-- <Input> -->
    <div class="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div class="relative flex">
        <span class="absolute inset-y-0 flex items-center">
          <button
            type="button"
            class="group inline-flex items-center justify-center rounded-full h-12 w-12 text-gray-500 focus:outline-none"
            transition="duration-500 ease-in-out"
            hover="bg-gray-300"
          >
            <!-- Sterring wheel icon -->
            <div
              class="i-mdi-steering text-2xl"
              :class="isStreaming ? 'text-[#30C5FF]' : ''"
              group-hover="scale-110"
              transition="ease-in-out duration-250"
              @click="toggleStreamingAudio"
            ></div>
          </button>
        </span>
        <input
          v-model="userInput"
          type="text"
          :placeholder="placeholder"
          class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
          @keydown.enter="detectInputText"
        />
        <div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-6 w-6 text-gray-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-6 w-6 text-gray-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-6 w-6 text-gray-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-6 w-6 text-gray-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
          >
            <span class="font-bold"> Enviar </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-6 w-6 ml-2 transform rotate-90"
            >
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-w-2::-webkit-scrollbar {
  width: 0.25rem;
  height: 0.25rem;
}

.scrollbar-track-blue-lighter::-webkit-scrollbar-track {
  --bg-opacity: 1;
  background-color: #f7fafc;
  background-color: rgba(247, 250, 252, var(--bg-opacity));
}

.scrollbar-thumb-blue::-webkit-scrollbar-thumb {
  --bg-opacity: 1;
  background-color: #edf2f7;
  background-color: rgba(237, 242, 247, var(--bg-opacity));
}

.scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
  border-radius: 0.25rem;
}
</style>

<route lang="yaml">
meta:
  layout: chatbot
</route>
