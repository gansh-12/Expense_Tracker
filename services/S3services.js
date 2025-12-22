//services/s3Service.js
const AWS=require("aws-sdk");

const s3bucket=new AWS.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
})

const uploadToS3=async (data,filename) => {
    const params={
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:filename,
        Body:data,
        ACL:'public-read'
    }

    return new Promise((resolve,reject) => {
        s3bucket.upload(params,(err,s3response) => {
            if (err) {
                console.log('Something went wrong',err);
                reject(err);
            } else {
                resolve(s3response.Location);
            }
        })
    })
}

module.exports={
    uploadToS3
}

