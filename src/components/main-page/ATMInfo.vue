<!-- eslint-disable no-unused-vars -->
<script setup lang="ts">
import { Unsubscribe } from 'firebase/firestore'
import { ATM } from '~/models/atm/atm'
import { defaultFirestoreService as alertService } from '~/services/firestore.service'
import {
  ATMUserReport,
  ATMUserReportKind,
  generateDescriptionTitle,
} from '~/models/atm-user-report'

const props = defineProps<{ atm: ATM }>()

const atmAlerts = ref<{ id: string; data: ATMUserReport }[]>([])
const unsuscribe = ref<Unsubscribe>()

const defaultInitialUserReport = {
  atmID: props.atm.id!,
  kind: ATMUserReportKind.NOT_WORKING,
}

const newReport = ref<Partial<ATMUserReport>>({ ...defaultInitialUserReport })

onMounted(async () => {
  // Get the alerts for this atm
  const snapshot = await alertService.getAllReportsForAtm(props.atm.id!)
  atmAlerts.value = snapshot.map((doc) => {
    return {
      id: doc.id,
      data: doc.data(),
    }
  })

  // Set listener for new alerts for this atm
  unsuscribe.value = alertService.setOnReportsUpdate(
    props.atm.id!,
    (snapshot) => {
      atmAlerts.value = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          data: doc.data(),
        }
      })
    }
  )
})

onUnmounted(() => {
  if (unsuscribe.value) {
    unsuscribe.value()
  }
})

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'select-travel-mode',
    travelMode: keyof typeof google.maps.TravelMode
  ): void
}>()

const upvoteReport = async (reportID: string) => {
  await alertService.upvoteUserReport(reportID)
}

const travelButtons: Array<{
  mode: keyof typeof google.maps.TravelMode
  icon: string
}> = [
  {
    mode: 'WALKING',
    icon: 'i-mdi:walk',
  },
  {
    mode: 'DRIVING',
    icon: 'i-mdi:car',
  },
  {
    mode: 'TRANSIT',
    icon: 'i-mdi:bus',
  },
  {
    mode: 'BICYCLING',
    icon: 'i-mdi:bicycle',
  },
]
// const emit = defineEmits(['close'])
const isAlertModalOpen = ref(false)

const openCreateAlertModal = async () => {
  isAlertModalOpen.value = true
}

const createAlert = async () => {
  if (
    newReport.value.kind === ATMUserReportKind.OTHER &&
    !newReport.value.description
  ) {
    // You have to put a description for kind 'OTHER'
    alert(
      'Por favor agrega una descripción para informar a los demás de la situación'
    )
    return
  }

  isAlertModalOpen.value = false

  await alertService.addUserReport(newReport.value)

  newReport.value.description = ''
  newReport.value.kind = ATMUserReportKind.NOT_WORKING
}

const closeCreateAlertModal = () => {
  isAlertModalOpen.value = false
}
</script>

<template>
  <div
    v-show="isAlertModalOpen"
    class="fixed top-0 left-0 w-100vw h-100vh bg-[#c9c4c4c4] z-100000 rounded p-4"
  >
    <div
      class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-auto bg-neutral-100 z-100000 rounded p-4"
    >
      <h1 class="text-1xl pb-2 border-b-2 mb-2">Nueva alerta</h1>
      <div class="pb-4">
        <label for="location" class="block text-sm font-medium text-gray-700"
          >Cajero</label
        >
        {{ atm.sitio }}
      </div>
      <div class="pb-4">
        <label
          for="location"
          class="block text-sm font-medium text-gray-700 pb-2"
          >Tipo</label
        >
        <div class="space-y-2">
          <div
            v-for="reportKind in Object.values(ATMUserReportKind)"
            :key="reportKind"
            class="flex items-center"
          >
            <input
              :id="reportKind"
              v-model="newReport.kind"
              name="notification-method"
              type="radio"
              :value="reportKind"
              :checked="reportKind === ATMUserReportKind.NOT_WORKING"
              class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label
              :for="reportKind"
              class="ml-3 block text-sm font-medium text-gray-700"
            >
              {{ generateDescriptionTitle(reportKind) }}
            </label>
          </div>
        </div>
      </div>
      <div pb-4>
        <label for="comment" class="block text-sm font-medium text-gray-700">
          Agrega una descripción
        </label>
        <div class="mt-1">
          <textarea
            id="comment"
            v-model="newReport.description"
            rows="4"
            name="comment"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <button
          type="button"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="closeCreateAlertModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="createAlert"
        >
          Crear Alerta
        </button>
      </div>
    </div>
  </div>

  <div class="flex flex-col heightWithoutNavbar gap-8">
    <div class="flex-[0_0_0]">
      <div class="">
        <div class="items-start justify-between">
          <div>
            <div class="relative h-40 sm:h-56 m:p-0">
              <img
                class="absolute h-full w-full object-fit"
                src="https://pr1.nicelocal.com.mx/MTxp7ucjC9wfA7uB3GpXvw/1280x720,q85/4px-BW84_n0QJGVPszge3NRBsKw-2VcOifrJIjPYFYkOtaCZxxXQ2ZQuIUACsUll0sz6N9tBE4x2xAUZ82C250mTSD4ma7Fn0Yoc3WwtQwga72mWVUaMfA"
                alt=""
              />
            </div>
            <!-- Title -->
            <!-- <h2 class="text-lg font-medium text-gray-900">
                          {{ title }}
                        </h2> -->
            <!-- <p class="text-sm font-medium text-gray-500">3.9 MB</p> -->
          </div>
        </div>
      </div>

      <div class="px-8 flex flex-col g-2 pt-8">
        <div class="flex-auto gap-4 grid">
          <div class="flex gap-2">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-600 text-light"
            >
              ACTIVO
            </span>
            <h3 class="font-medium text-gray-900">CAJERO {{ atm.sitio }}</h3>
          </div>
          <div class="flex gap-2 items-center">
            <div class="flex-none self-stretch">
              <svg
                class="w-6 h-full"
                fill="black"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-black">
                {{ atm.calle }}, Col. {{ atm.colonia }}, Num. {{ atm.numExt }},
                {{ atm.colonia }}, {{ atm.delMuni }}
              </p>
            </div>
          </div>

          <div class="py-1 border-y flex justify-between px-2 border-gray">
            <p class="text-black">Rutas</p>
          </div>
          <div class="flex justify-between w-full">
            <button
              v-for="travelButton in travelButtons"
              :key="travelButton.mode"
              type="button"
              class="inline-flex items-center px-6 py-1 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-blue-600"
              @click="emit('select-travel-mode', travelButton.mode)"
            >
              <div :class="travelButton.icon"></div>
            </button>
          </div>

          <div
            class="py-2 border-t border-b flex justify-between px-2 border-gray"
          >
            <p class="text-black">Alertas</p>
            <button
              class="i-heroicons-plus-circle-20-solid text-xl"
              :onClick="openCreateAlertModal"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-scroll px-8 pb-4 grid gap-4 scrollbarHidden">
      <div v-for="alert in atmAlerts" :key="alert.id">
        <Alert :alert="alert.data" @upvote="upvoteReport(alert.id)" />
      </div>
    </div>

    <div class="flex flex-[0_0_0] h-30 pb-8">
      <button
        type="button"
        class="flex-auto rounded-md border border-transparent bg-indigo-600 py-2 mx-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        @click="emit('close')"
      >
        OK
      </button>
    </div>
  </div>
</template>

<!-- function ref(arg0: boolean) { throw new Error('Function not implemented.') } -->
