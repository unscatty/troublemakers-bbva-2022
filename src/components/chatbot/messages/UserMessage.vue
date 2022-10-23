<script setup lang="ts">
import ChatbotUserMessage from '~/models/chatbot/messages/user-message'

defineProps<{ message: ChatbotUserMessage }>()
</script>

<template>
  <div class="chat-message">
    <span class="px-4 py-2 rounded-lg inline-block bg-blue-600 text-white text-left md:text-sm">
      {{ message.text }}
    </span>
  </div>
</template>

<style scoped></style>
