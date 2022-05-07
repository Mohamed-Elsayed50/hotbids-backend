import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {Car} from "./Car";
import {Files} from "../helpers/Files";

@Index("car_image_to_car", ["carId"], {})
@Entity("car_image", {schema: "bids"})
export class CarImage extends BaseEntity {
    static readonly TYPE_EXTERIOR = 1;
    static readonly TYPE_INTERIOR = 2;
    static readonly TYPE_MECHANICAL = 3;
    static readonly TYPE_DOCS = 4;
    static readonly TYPE_OTHER = 5;

    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "car_id", nullable: true})
    carId: number | null;

    @Column("varchar", {name: "url", nullable: true, length: 255})
    url: string | null;

    @Column("varchar", {name: "path", nullable: true, length: 255})
    path: string | null;

    @Column("tinyint", {name: "type", nullable: true})
    type: number | null;

    @ManyToOne(() => Car, (car) => car.carImages, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "car_id", referencedColumnName: "id"}])
    car: Car;

    static async addCarImage(car: Car | null, oldPath: string | null, path: string, type: number) {
        let url = await Files.upload(oldPath, path)

        if (!url) {
            return false
        }

        const image = new CarImage()

        if (car) {
            image.car = car
        }

        image.url = url
        image.path = path
        image.type = type
        return await image.save()
    }

    static async bindImageToCar(car: Car, imageid: number) {
        const image = await CarImage.findOneOrFail(imageid)
        
        if (image.carId === car.id) return

        image.car = car
        return await image.save()
    }

    static async removeCarImages(car: Car) {
        let images
        images = await CarImage.find({ where: { car } })
        await CarImage.remove(images)
    }
}
