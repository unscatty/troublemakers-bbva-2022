import type { ATM } from '../atm/atm'

// Mockup interface to be used with BBVA atm API
export interface ApiATM {
  IdPunto?: string
  IdCatalogo?: number
  Nombre?: string
  NombreLugar?: string
  HorarioSemana?: string
  HorarioSabatino?: string
  DisponibleSabado?: boolean
  Calle?: string
  NumeroExterior?: string
  NumeroInterior?: string
  CalleUno?: string
  CalleDos?: string
  Colonia?: string
  Delegacion?: string
  CodigoPostal?: string
  Estado?: string
  Latitud?: string
  Longitud?: string
  Distancia?: number
  Icono?: string
  Servicios?: string[]
  Cr?: number
  HorarioDomingo?: string
  Telefono?: string
  Correo?: string
}

export const toATM = (apiATM: ApiATM): ATM => {
  const {
    IdPunto,
    Nombre,
    Cr,
    Calle,
    NumeroExterior,
    Estado,
    CodigoPostal,
    Delegacion,
    Colonia,
    Latitud,
    Longitud,
  } = apiATM

  return {
    id: IdPunto,
    sitio: Nombre,
    cr: Cr,
    calle: Calle,
    numExt: NumeroExterior,
    estado: Estado,
    cp: CodigoPostal,
    delMuni: Delegacion,
    colonia: Colonia,
    latitud: parseFloat(Latitud || ''),
    longitud: parseFloat(Longitud || ''),
  }
}
