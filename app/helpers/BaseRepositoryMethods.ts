import { Question } from "app/models/Question";
import { getRepository } from "typeorm";

export class BaseRepositoryMethods {

    async getById(id) {
        getRepository(Question)
    }


}
