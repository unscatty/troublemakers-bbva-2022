/* eslint-disable no-unused-vars */
import type { ATM } from '~/models/atm/atm'
import IATMService from './atm.service.interface'

export default class ATMService implements IATMService {
  constructor(private baseURL: string) {}

  async getClosestATMs(
    userLocation: google.maps.LatLngLiteral,
    limit = 5,
    resourceID = 'atms'
  ): Promise<ATM[]> {
    const apiResponse = await fetch(`${this.baseURL}/${resourceID}`, {
      body: JSON.stringify({
        location: userLocation,
        limit,
      }),
      method: 'POST',
    })

    const data = (await apiResponse.json()) as ATM[]

    return data
  }

  async getClosestATM(userLocation: google.maps.LatLngLiteral): Promise<ATM> {
    const atms = await this.getClosestATMs(userLocation, 1)
    return atms[0]
  }
}

export const defaultATMService = new ATMService(
  import.meta.env.VITE_SERVER_ENDPOINT
)
