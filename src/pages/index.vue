<script setup lang="ts">
import { GoogleMap, CustomMarker } from 'vue3-google-map'
import type { ATM } from '~/models/atm/atm'
import { atmToLatLngLiteral } from '~/models/atm/atm'
// import atmService from '~/services/atms/api/api-atm.service'
import { defaultATMService as atmService } from '~/services/atms/atm.service'
import { toLatLngLiteral } from '~/utils/geolocation'
import styles from '~/styles/map-style'

const center = ref<google.maps.LatLngLiteral>({
  lat: 19.43302471023951,
  lng: -99.13224809885025,
})
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const gmaps = ref<InstanceType<typeof GoogleMap>>()
const currentPosition = ref<GeolocationPosition>()
// let distanceService: google.maps.DistanceMatrixService

let directionsServices: google.maps.DirectionsService
let directionsRenderer: google.maps.DirectionsRenderer

// The bounds for the atms markers
let bounds: google.maps.LatLngBounds

// const distanceAPI = ref(0)
let atmLocations = ref<ATM[]>([])

// Modal dialog
let modalOpen = ref(false)
let selectedATM = ref<ATM>()

const positionCallback = (position: GeolocationPosition) => {
  currentPosition.value = position

  center.value = toLatLngLiteral(currentPosition.value)

  console.log('location has changed')
}

const init = () => {
  // Initialize all values when Google Maps API script is fully loaded
  directionsServices = new google.maps.DirectionsService()
  directionsRenderer = new google.maps.DirectionsRenderer()
  directionsRenderer.setMap(gmaps.value?.map || null)

  bounds = new google.maps.LatLngBounds()
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      positionCallback,
      (error) => alert(error),
      {
        enableHighAccuracy: true,
      }
    )
  }

  if (bounds && !bounds.isEmpty()) {
    gmaps.value?.map?.fitBounds(bounds)
    gmaps.value?.map?.panToBounds(bounds)
  }
}

const getNearATMs = async (location: google.maps.LatLngLiteral) => {
  bounds = new google.maps.LatLngBounds()

  // Add user location
  bounds.extend(center.value)

  try {
    atmLocations.value = await atmService.getClosestATMs(location, 10)

    atmLocations.value.forEach((atm) => bounds.extend(atmToLatLngLiteral(atm)))
  } catch (error) {
    console.error(error)
  }

  gmaps.value?.map?.fitBounds(bounds)
  gmaps.value?.map?.panToBounds(bounds)
}

const getRouteToATM = async (
  travelModeString: keyof typeof google.maps.TravelMode
) => {
  if (!selectedATM.value) return

  const travelMode = google.maps.TravelMode[travelModeString]

  await directionsServices.route(
    {
      origin: center.value,
      destination: atmToLatLngLiteral(selectedATM.value),
      travelMode: travelMode,
      unitSystem: google.maps.UnitSystem.METRIC,
    },
    function (result, status) {
      if (status == 'OK') {
        directionsRenderer.setDirections(result)
      }
    }
  )

  closeATMInfo()
}

const showATMInfo = (atm: ATM) => {
  selectedATM.value = atm

  modalOpen.value = true
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      positionCallback,
      (error) => alert(error),
      {
        enableHighAccuracy: true,
      }
    )
  }
})

const closeATMInfo = () => (modalOpen.value = false)

watch(
  () => gmaps.value?.ready,
  (ready) => {
    if (ready) {
      init()
    }
  }
)
</script>

<template>
  <div class="bakcground">
    <div class="container">
      <div>
        <img class="aIntro" src="/svgs/A.svg" alt="" />
      </div>
      <div>
        <img class="bbvIntro" src="/svgs/BBV.svg" alt="" />
      </div>
    </div>
  </div>
  <FlyoutMenu
    :is-home-page="true"
    @nearby-atms="getNearATMs(center)"
    @update-location="getLocation"
  />
  <GoogleMap
    ref="gmaps"
    :api-key="API_KEY"
    class="absolute w-full h-full bottom-0"
    :center="center"
    :zoom="15"
    :styles="styles"
    language="es-MX"
    :street-view-control="false"
  >
    <CustomMarker
      :options="{
        position: center,
        anchorPoint: 'BOTTOM_CENTER',
      }"
    >
      <div class="i-mdi-map-marker-account text-[2.5rem] text-rose-5"></div>
    </CustomMarker>
    <CustomMarker
      v-for="(location, index) in atmLocations"
      :key="index"
      :options="{
        position: atmToLatLngLiteral(location),
        anchorPoint: 'BOTTOM_CENTER',
      }"
      @click="showATMInfo(location)"
    >
      <div class="i-mdi-map-marker-radius text-blue-9 text-4xl"></div>
      <div
        class="i-mdi-atm text-blue-9 text-3xl relative -top-17 left-0.65"
      ></div>
    </CustomMarker>

    <InfoDialog
      title="Cajero Automático"
      :show="modalOpen"
      @close="closeATMInfo"
    >
      <ATMInfo
        :atm="selectedATM!"
        @close="closeATMInfo"
        @select-travel-mode="getRouteToATM"
      />
    </InfoDialog>
  </GoogleMap>
</template>

<route lang="yaml">
meta:
  layout: map
</route>
