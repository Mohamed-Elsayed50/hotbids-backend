import {Car} from "../models/Car";

const algoliasearch = require('algoliasearch');

export class Algolia {

    static client
    static index

    static init(id: string, adminApiKey: string) {
        Algolia.client = algoliasearch(id, adminApiKey)
        Algolia.index = Algolia.client.initIndex('hotbids')
    }

    static async replaceAllCars() {
        if (!Algolia.index)
            return;

        let cars = await Car.find({
            where: {
                verified: 1
            }
        })

        let convertedCars: object[] = []
        for (let car of cars)
            convertedCars.push(car.getDataForAlgolia())

        Algolia.index.replaceAllObjects(convertedCars)
                .catch((err) => {console.log(err)})
    }

    static async addOrUpdateCar(car: Car) {
        if (!Algolia.index)
            return;

        Algolia.index.saveObject(car.getDataForAlgolia())
                .catch((err) => {console.log(err)})
    }

    static async removeCar(carId: number) {
        if (!Algolia.index)
            return;

        Algolia.index.deleteObject(carId)
                .catch((err) => {console.log(err)})
    }

    static async getCars(query: string) {
        if (!Algolia.index) {
            console.log('algoliaSearch returning')
            return
        }

        return await Algolia.index.search(query)
    }
}
