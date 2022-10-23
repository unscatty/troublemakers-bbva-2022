export function haversine_distance(mk1: google.maps.LatLng, mk2: google.maps.LatLng) {
  // const R = 3958.8 // Radius of the Earth in miles
  const R = 6371071.0 // Radius of the Earth in meters
  const rlat1 = mk1.lat() * (Math.PI / 180) // Convert degrees to radians
  const rlat2 = mk2.lat() * (Math.PI / 180) // Convert degrees to radians
  const difflat = rlat2 - rlat1 // Radian difference (latitudes)
  const difflon = (mk2.lng() - mk1.lng()) * (Math.PI / 180) // Radian difference (longitudes)

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)))
  return d
}

