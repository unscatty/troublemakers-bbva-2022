<script setup lang="ts">
import {
  Dialog as ModalDialog,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

defineProps<{ title: string; show: boolean }>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<template>
  <TransitionRoot as="template" :show="show">
    <ModalDialog
      as="div"
      class="fixed inset-0 overflow-hidden z-9999"
      @close="close"
    >
      <div class="absolute inset-0 overflow-hidden h-100vh">
        <TransitionChild
          as="template"
          enter="ease-in-out duration-500"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in-out duration-500"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay
            class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>
        <div
          class="pointer-events-none fixed flex max-w-full w-full bottom-0 md:inset-y-0 md:right-0 md:flex-row-reverse"
        >
          <TransitionChild
            as="template"
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enter-from="translate-y-full md:translate-x-full md:translate-y-0"
            enter-to="translate-y-0 md:translate-x-0 md:translate-y-0"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leave-from="translate-y-0 md:translate-x-0 md:translate-y-0"
            leave-to="translate-y-full md:translate-x-full md:translate-y-0"
          >
            <div class="pointer-events-auto relative w-full md:w-100">
              <div
                class="h-full overflow-y-auto bg-white rounded-t-5 md:rounded-none"
              >
                <div class="">
                  <!-- Component -->
                  <slot></slot>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </ModalDialog>
  </TransitionRoot>
</template>
