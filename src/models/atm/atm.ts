// Interface we'll use with csv files
export interface ATM {
  id?: string
  sitio?: string
  // ¿Código de región?
  cr?: number
  division?: string
  marca?: string
  tipoDispositivo?: string
  estatus?: string
  calle?: string
  numExt?: string
  estado?: string
  ciudad?: string
  cp?: string
  // Delegación/Municipio
  delMuni?: string
  colonia?: string
  latitud?: number | string
  longitud?: number | string
  tipoLocalidad?: string
  idc?: string
  etv?: string

  // Distance (in straight line) calculated from BigQuery
  straight_distance?: number
}

export const generateDescriptions = (
  atm: ATM
): { name: string; value?: string }[] => {
  const { sitio, calle, numExt, estado, colonia, delMuni } = atm

  return [
    {
      name: 'Nombre',
      value: sitio,
    },
    {
      name: 'Calle',
      value: calle,
    },
    {
      name: 'Número Exterior',
      value: numExt,
    },
    {
      name: 'Estado',
      value: estado,
    },
    {
      name: 'Colonia',
      value: colonia,
    },
    {
      name: 'Delegación/Municipio',
      value: delMuni,
    },
  ]
}

export const atmToLatLngLiteral = (atm: ATM): google.maps.LatLngLiteral => {
  return {
    lat: parseFloat(atm.latitud?.toString() || ''),
    lng: parseFloat(atm.longitud?.toString() || ''),
  }
}

export const atmToLatLng = (atm: ATM): google.maps.LatLng => {
  return new google.maps.LatLng(atmToLatLngLiteral(atm))
}
