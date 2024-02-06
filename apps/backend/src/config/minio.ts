import * as Minio from "minio";
const { ACCESS_KEY, SECRET_KEY, HOST } = process.env;

export const minioClient = new Minio.Client({
    endPoint: HOST!,
    accessKey: ACCESS_KEY!,
    secretKey: SECRET_KEY!,
});
