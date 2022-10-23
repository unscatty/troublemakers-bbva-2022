import { ApiATM, toATM } from '~/models/atms-api/api-atm'
import IATMService from '../atm.service.interface'

export class ApiATMService implements IATMService {
  async getClosestATMs(location: google.maps.LatLngLiteral) {
    const now = new Date()

    const bodyParams: Record<string, any> = {
      metodo: 'getPuntos',
      latitud: location.lat,
      longitud: location.lng,
      idOpcionCatalogo: 11,
      idOpcionAtributo: 14,
      dia: now.getDay(),
      hora: '0:0',
      ubicacion: 1,
      direccion: 0,
      // fecha: now.toString(),
    }

    // Build form data
    const formBody = []
    for (let property in bodyParams) {
      let encodedKey = encodeURIComponent(property)
      let encodedValue = encodeURIComponent(bodyParams[property])
      formBody.push(encodedKey + '=' + encodedValue)
    }

    const apiResponse = await fetch(
      'https://www.strategis.mx/Glocator/common/services/Buscador.ashx',
      {
        body: formBody.join('&'),
        method: 'POST',

        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      }
    )

    const data = (await apiResponse.json()).Obj as ApiATM[]

    return data.map((apiATM) => toATM(apiATM))
  }

  async getClosestATM(userLocation: google.maps.LatLngLiteral) {
    const atms = await this.getClosestATMs(userLocation)

    return atms[0]
  }
}

export default new ApiATMService()
