import cvs from 'csv-parser'
import fs from 'fs'
import { Location as LocationD } from '../models/Location'

export class LocationData {
    static async init() {
        let hasLocations = true
        console.log('\n--- Start inserting locations ---')
        try {
            await LocationD.findOneOrFail()
        } catch (error) {
            hasLocations = false
        }

        if (hasLocations) {
            console.log('--- Locations already exists ---\n')
            return
        }

        try {
            await LocationData.insertCsv('./app/assets/us.csv', 10)
            await LocationData.insertCsv('./app/assets/ca_1.csv', 128)
            await LocationData.insertCsv('./app/assets/ca_2.csv', 128)
            await LocationData.insertCsv('./app/assets/ca_3.csv', 128)
            await LocationData.insertCsv('./app/assets/ca_4.csv', 128)
            await LocationData.insertCsv('./app/assets/ca_5.csv', 128)
            await LocationData.insertCsv('./app/assets/ca_6.csv', 128)
        } catch (error) {
            throw error
        }

        console.log('--- End inserting locations ---\n')
    }

    static insertCsv(path: string, chunk = 10): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const locations: LocationD[] = []

            fs.createReadStream(path)
            .pipe(cvs())
            .on('data', (data) => {
                locations.push(LocationD.createLocation(data))
            })
            .on('end', async () => {
                console.log(`Start inserting ${path}...`)
                console.time(`End Inserting ${path}`)
                try {
                    await LocationD.insert(locations, {
                        chunk
                    })
                    resolve(true)
                } catch (error) {
                    reject(error)
                }
                console.timeEnd(`End Inserting ${path}`)
            })
        })
    }
}
