<script setup lang="ts">
import {
  ATMUserReport,
  generateDescriptionTitle,
} from '~/models/atm-user-report'
import { SPANISH_MESSAGES } from '~/utils/time-ago'

defineProps<{ alert: ATMUserReport }>()

const emit = defineEmits(['upvote'])
</script>

<template>
  <div class="rounded-md bg-yellow-2 p-4">
    <div class="flex">
      <div class="">
        <div class="flex flex-col justify-between items-center h-full">
          <div
            class="i-heroicons-exclamation-triangle text-yellow-700 text-xl"
            aria-hidden="true"
          />
          <button
            class="i-heroicons:chevron-up"
            @click="emit('upvote')"
          ></button>
          <div v-if="alert.upvotes > 0" class="text-xs">
            {{ alert.upvotes }}
          </div>
        </div>
      </div>
      <div class="ml-3.5 flex flex-col w-full">
        <h3 class="text-sm font-medium text-yellow-800">
          {{ generateDescriptionTitle(alert.kind) }}
        </h3>
        <div class="mt-2 text-sm text-yellow-700">
          <p>{{ alert.description }}</p>
        </div>
        <!-- <div class="mt-2 text-sm text-yellow-700 text-end">
          {{
            useTimeAgo(alert.timestamp.toDate(), {
              messages: SPANISH_MESSAGES,
            }).value.replaceAll('"', '')
          }}
        </div> -->
        <div class="mt-2 text-xs text-yellow-700 text-end">
          {{
            useTimeAgo(alert.timestamp.toDate(), {
              messages: SPANISH_MESSAGES,
            }).value.replaceAll('"', '')
          }}
        </div>
      </div>
    </div>
  </div>
</template>
