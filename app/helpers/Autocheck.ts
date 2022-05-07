import { Files } from "../helpers/Files"
import autocheckDesignFix from '../utils/autocheckDesignFix'
const queryString = require('querystring')
const http = require('https')
const puppeteer = require('puppeteer')
import { ErrorVINDoesntExist, ErrorAutocheckFailed } from '../dictionaries/validation/CarErrors'

const { v4 } = require('uuid')

export default function checkVIN(vin: string) {
    const postData = {
        VIN: vin,
        CID: process.env.AUTOCHECK_CID,
        PWD: process.env.AUTOCHECK_PWD,
        SID: process.env.AUTOCHECK_SID
    }

    const query = queryString.encode(postData)

    const options = {
        host: 'www.autocheck.com',
        port: 443,
        path: '/DealerWebLink.jsp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(query)
        }
    }

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let chunks = ''
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                chunks += chunk
            })
            res.on('end', async () => {
                /*if (!chunks.length || chunks.indexOf('error pages') !== -1) {
                    return reject(new ErrorVINDoesntExist())
                }

                if (chunks.indexOf('We are experiencing intermittent issues with our service') !== -1
                    || chunks.indexOf('We are sorry, but the vehicle history report cannot be displayed at this time') !== -1) {
                    return reject(new ErrorAutocheckFailed())
                }

                chunks = autocheckDesignFix(chunks)

                const options = {
                    printBackground: true,
                    format: 'Letter',
                }
                const browser = await puppeteer.launch()
                const page = await browser.newPage()

                try {
                    await page.setContent(chunks, { waitUntil: ['load', 'networkidle0'] })
                    const pdf = await page.pdf(options)
                    const url = await Files.upload(pdf, `reports/${v4()}.pdf`, true, 'application/pdf', true)
                    resolve(url)
                } catch {
                    reject(new ErrorAutocheckFailed())
                } finally {
                    await browser.close()
                }*/
                resolve("https://carauction-assets.s3.us-west-2.amazonaws.com/reports/1B3JZ65Z95V501808-cbeb38c0-89a0-4606-8f42-b661b3169cee.pdf");
            })
        })

        req.on('error', (e) => {
            console.error(`problem with request to the AUTOCHECK: ${e.message}`);
            reject(new ErrorAutocheckFailed())
        })

        req.write(query)
        req.end()
    })
}