import {Request, Response} from 'express';
import {Page} from '../models/Page';

class PageController {
    static async getPageById(req: Request, res: Response) {
        let page: Page

        try {
            page = await Page.getPageWithOptions({ id: req.params.id })
        } catch {
            res.status(404).send('page not found')
            return
        }

        res.status(200).send(page)
    }

    static async getPageByUrl(req: Request, res: Response) {
        let page: Page

        try {
            page = await Page.getPageWithOptions({ url: req.params.url })
        } catch {
            res.status(404).send('page not found')
            return
        }

        res.status(200).send(page)
    }
}

export default PageController;
