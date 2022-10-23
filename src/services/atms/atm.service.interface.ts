/* eslint-disable no-unused-vars */
import type { ATM } from '~/models/atm/atm'

export default abstract class IATMService {
  abstract getClosestATMs: (
    userLocation: google.maps.LatLngLiteral,
    ...extraArgs: any[]
  ) => ATM[] | Promise<ATM[]>
  abstract getClosestATM: (
    userLocation: google.maps.LatLngLiteral,
    ...extraArgs: any[]
  ) => ATM | Promise<ATM>
}
