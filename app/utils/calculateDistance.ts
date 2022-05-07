import { Car } from "../models/Car"
import CarController from "../controllers/CarController"
import { Location as LocationModel } from '../models/Location'

export default async function calculateDistance(zipCode: string, distance: number, cars: Array<Car>) {
    const distances = {}
    const maxDistance = distance * 1.609 || 40075
    const p = 0.017453292519943295
    const { lat: curLat, lng: curLng } = await LocationModel.findOrFailLocation({ zipCode, cityAndProvince: '' })

    cars = cars.filter(({ location: loc }) => {
        const { lat, lng } = loc || {}

        if (lat === null || lng === null || curLat === null || curLng === null) return false

        let dist = 0.5 - Math.cos((curLat - lat) * p) / 2
            + Math.cos(lat * p) * Math.cos(curLat * p)
            * (1 - Math.cos((curLng - lng) * p)) / 2
        dist = 12742 * Math.asin(Math.sqrt(dist))

        distances[loc.zipCode as string] = dist

        return dist <= maxDistance
    })

    cars.sort((a, b) => distances[a.location.zipCode as string] - distances[b.location.zipCode as string])

    return cars
}
