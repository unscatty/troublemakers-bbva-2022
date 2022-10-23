<script setup lang="ts">
import ChatbotUserMessage from '~/models/chatbot/messages/user-message'

defineProps<{ messages: ChatbotUserMessage[], imgSrc: string }>()
</script>

<template>
  <div class="chat-message-group user-group">
    <div class="flex items-end justify-end">
      <div
        class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end"
      >
        <template v-for="(message, index) in messages" :key="index">
          <UserMessage :message="message" />
        </template>
      </div>
      <img
        :src="imgSrc"
        alt="User image"
        class="w-6 h-6 rounded-full order-2"
      />
    </div>
  </div>
</template>

<style scoped></style>
