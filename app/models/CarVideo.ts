import {BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {Car} from "./Car";

@Index("car_video_to_car", ["carId"], {})
@Entity("car_video", {schema: "bids"})
export class CarVideo extends BaseEntity {
    @PrimaryGeneratedColumn({type: "int", name: "id"})
    id: number;

    @Column("int", {name: "car_id", nullable: true})
    carId: number | null;

    @Column("varchar", {name: "url", nullable: true, length: 255})
    url: string | null;

    @ManyToOne(() => Car, (car) => car.carVideos, {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT",
    })
    @JoinColumn([{name: "car_id", referencedColumnName: "id"}])
    car: Car;

    static async addCarVideo(car: Car, url: string) {
        try {
            await CarVideo.findOneOrFail({ where: { url } })
            return
        } catch (error) {}

        const video = new CarVideo()
        video.car = car
        video.url = url
        return await video.save()
    }

    static async removeCarVideos(car: Car) {
        const videos = await CarVideo.find({ where: { car } })
        await CarVideo.remove(videos)
    }
}
