<script setup lang="ts">
import ChatbotReplyMessage from '~/models/chatbot/messages/reply-message'

defineProps<{ messages: ChatbotReplyMessage[], imgSrc: string }>()
</script>

<template>
  <div class="chat-message-group reply-group">
    <div class="flex items-end">
      <div
        class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start"
      >
        <template v-for="(message, index) in messages" :key="index">
          <ReplyMessage :message="message" />
        </template>
      </div>
      <img
        :src="imgSrc"
        alt="My profile"
        class="w-6 h-6 rounded-full order-1"
      />
    </div>
  </div>
</template>

<style scoped></style>
