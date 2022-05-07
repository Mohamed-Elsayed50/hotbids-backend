import { ErrorCityDoesntExist, ErrorZipCodeDoesntExist } from "../dictionaries/validation/CarErrors";
import { JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Car } from "./Car";

@Entity("location", { schema: "location" })
export class Location extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "int", name: "id" })
    id: number;

    @Column("varchar", { name: "zip_code", nullable: true, length: 16 })
    zipCode: string | null;

    @Column("varchar", { name: "city", nullable: true, length: 255 })
    city: string | null;

    @Column("varchar", { name: "state", nullable: true, length: 255 })
    state: string | null;

    @Column("varchar", { name: "country", nullable: true, length: 255 })
    country: string | null;

    @Column("float", { name: "lat", nullable: true })
    lat: number | null;

    @Column("float", { name: "lng", nullable: true })
    lng: number | null;

    @OneToMany(() => Car, (car) => car.location)
    cars: Car[];

    static createLocation(params) {
        const {
            ['Zip Code']: zipCode,
            City,
            State,
            ZipLatitude,
            ZipLongitude,

            LATITUDE,
            LONGITUDE,
            POSTAL_CODE,
            CITY,
            PROVINCE_ABBR
        } = params

        const location = new Location()
        location.zipCode = zipCode || POSTAL_CODE
        location.city = City || CITY
        location.state = State || PROVINCE_ABBR
        location.lng = ZipLongitude || LONGITUDE
        location.lat = ZipLatitude || LATITUDE
        location.country = (zipCode || POSTAL_CODE).match(/^[a-zA-Z]/) ? 'CA' : 'US'

        return location
    }

    static async findOrFailLocation(location: { zipCode: string, cityAndProvince: string }) {
        const {
            zipCode,
            cityAndProvince
        } = location

        try {
            const locationQuery = await Location.createQueryBuilder('location')

            if (zipCode) {
                locationQuery.where('location.zipCode = :zipCode', { zipCode: zipCode.trim().toUpperCase() })
            } else if (cityAndProvince) {
                locationQuery.where('location.city = :city', { city: cityAndProvince.trim().toUpperCase() })
            }

            const location = await locationQuery.getOne()

            if (!location) throw new Error()

            return location
        } catch (error) {
            throw zipCode ? new ErrorZipCodeDoesntExist() : new ErrorCityDoesntExist()
        }
    }
}
