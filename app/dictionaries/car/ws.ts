import { Car } from "app/models/Car";

export enum wsEvents {
    CAR_PAUSE = 'CAR_PAUSE',
    CAR_CONTINUE = 'CAR_CONTINUE',
    CAR_RESTART = 'CAR_RESTART',
    CAR_FINISH = 'CAR_FINISH',
    CAR_UPDATED = 'CAR_UPDATED'
}

export enum wsActions {
}

export enum wsRooms {
}

export function ROOM_CAR(car: Car) {
    return `car-${car.id}`
}