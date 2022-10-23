<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

defineProps({
  isHomePage: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['nearby-atms', 'update-location'])

const company = [
  {
    name: 'Acerca de ',
    href: '#',
    icon: 'i-heroicons-information-circle-20-solid',
  },
  { name: 'Clientes', href: '#', icon: 'i-heroicons-building-office-20-solid' },
  { name: 'Newsletter', href: '#', icon: 'i-heroicons-newspaper-20-solid' },
  { name: 'Privacidad', href: '#', icon: 'i-heroicons-shield-check-20-solid' },
]
const navigationResources = [
  { name: 'Página principal', to: '/', icon: 'i-heroicons-home-20-solid' },
  {
    name: 'Asistente ATM',
    to: '/asistente',
    icon: 'i-bxs-bot',
  },
]
</script>

<template>
  <Popover v-slot="{ open }" class="z-1 relative">
    <div class="relative z-10 bg-white shadow">
      <div class="max-w-7xl mx-auto flex px-4 py-4 sm:px-6 lg:px-8">
        <PopoverButton
          :class="[
            open ? 'text-gray-900' : 'text-gray-500',
            'group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
          ]"
        >
          <span>Menú</span>
          <div
            class="i-heroicons-chevron-down"
            :class="[
              open ? 'text-gray-600' : 'text-gray-400',
              'ml-2 h-5 w-5 group-hover:text-gray-500',
            ]"
            aria-hidden="true"
          />
        </PopoverButton>
        <div v-if="isHomePage" class="inline-flex items-center w-full justify-end">
          <button
            type="button"
            class="inline-flex mx-2 items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            focus="outline-none ring-2 ring-offset-2 ring-indigo-500"
            @click="emit('nearby-atms')"
          >
            Cajeros cercanos
            <div
              class="i-mdi-map-marker-circle ml-2 -mr-0.5 h-4 w-4"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            class="group inline-flex items-center justify-center rounded-full text-gray-500 focus:outline-none"
            transition="duration-500 ease-in-out"
            hover="bg-gray-300"
            @click="emit('update-location')"
          >
            <div
              class="i-mdi-crosshairs-gps text-xl"
              transition="ease-in-out duration-250"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <PopoverPanel class="absolute z-10 inset-x-0 transform shadow-lg">
        <div class="absolute inset-0 flex" aria-hidden="true">
          <div class="bg-white w-full" />
        </div>
        <div class="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          <nav
            class="grid gap-y-10 px-4 py-8 bg-white sm:grid-cols-2 sm:gap-x-8 sm:py-12 sm:px-6 lg:px-8 xl:pr-12"
            aria-labelledby="solutions-heading"
          >
            <div>
              <h3
                class="text-sm font-medium tracking-wide text-gray-500 uppercase"
              >
                Navegar
              </h3>
              <ul role="list" class="mt-5 space-y-6">
                <li
                  v-for="item in navigationResources"
                  :key="item.name"
                  class="flow-root"
                >
                  <RouterLink
                    :to="item.to"
                    class="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150"
                  >
                    <div
                      :class="item.icon"
                      class="flex-shrink-0 h-6 w-6 text-gray-400"
                    ></div>
                    <span class="ml-4">{{ item.name }}</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
            <div>
              <h3
                class="text-sm font-medium tracking-wide text-gray-500 uppercase"
              >
                Enlaces de interés
              </h3>
              <ul role="list" class="mt-5 space-y-6">
                <li v-for="item in company" :key="item.name" class="flow-root">
                  <a
                    :href="item.href"
                    class="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 transition ease-in-out duration-150"
                  >
                    <div
                      :class="item.icon"
                      class="flex-shrink-0 h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    ></div>

                    <span class="ml-4">{{ item.name }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>
