const {
    S3Client,
    PutObjectCommand
} = require("@aws-sdk/client-s3");
const fs = require('fs')

export class Files {

    static s3;
    static bucket;
    static region;

    static init(accessKey: string, secretAccessKey: string, region: string, bucket: string) {
        Files.s3 = new S3Client({
            accessKeyId: accessKey,
            secretAccessKey: secretAccessKey,
            region: region
        })

        Files.region = region
        Files.bucket = bucket
    }

    static async upload(tmpPath, newPath, rawBody = false, contentType = '', publicAccess = false) {
        const params = {
            Bucket: Files.bucket,
            Key: newPath,
            Body: rawBody ? tmpPath : fs.readFileSync(tmpPath)
        } as { [key: string]: any };

        if (publicAccess) {
            params.ACL = 'public-read'
        }

        if (contentType) {
            params.ContentType = contentType
        }

        let data = null

        try {
            data = await Files.s3.send(new PutObjectCommand(params))
        } catch (err) {
            console.error('Cant upload file')
            console.error(err)
        } finally {
            if (!rawBody && tmpPath) {
                fs.unlink(tmpPath, () => { })
            }
        }

        return `https://${Files.bucket}.s3.${Files.region}.amazonaws.com/${newPath}`;
    }

}
