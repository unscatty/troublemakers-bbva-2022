<script setup lang="ts">
import ChatbotReplyMessage from '~/models/chatbot/messages/reply-message'

defineProps<{ message: ChatbotReplyMessage }>()

// const emit = defineEmits<{
//   // eslint-disable-next-line no-unused-vars
//   (event: 'image-clicked', imageSrc: string): void
// }>()

// For the image modal
const isImageModalOpen = ref(false)
const imageModalSrc = ref('')

const openImageModal = (imageSrc: string) => {
  imageModalSrc.value = imageSrc
  isImageModalOpen.value = true
}

const closeImageModal = () => {
  isImageModalOpen.value = false
}

</script>

<template>
  <ChatbotImageModal :image-src="imageModalSrc" :show="isImageModalOpen" @close="closeImageModal" />
  <div class="chat-message">
    <span
      class="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600 md:text-sm text-left"
    >
      <template v-if="message.mapImageSrc">
        <img
          :src="message.mapImageSrc"
          alt="ruta"
          class="cursor-pointer"
          @click="openImageModal(message.mapImageSrc!)"
        />
      </template>

      <br v-if="message.mapImageSrc && message.text" />

      {{ message.text }}
    </span>
  </div>
</template>

<style scoped></style>
