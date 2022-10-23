export const toLatLng = (location: GeolocationPosition) => {
  return new google.maps.LatLng(toLatLngLiteral(location))
}

export const toLatLngLiteral = (
  location: GeolocationPosition
): google.maps.LatLngLiteral => {
  return { lat: location.coords.latitude, lng: location.coords.longitude }
}
