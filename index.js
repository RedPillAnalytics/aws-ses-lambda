require('dotenv').config();
const aws = require('aws-sdk');
const nodemailer = require("nodemailer");

const ses = new aws.SES({region: 'us-east-1'});
const s3 = new aws.S3();


function getS3File(bucket, key) {
  return new Promise(function(resolve, reject) {
      s3.getObject(
          {
              Bucket: bucket,
              Key: key
          },
          function (err, data) {
              if (err) return reject(err);
              else return resolve(data);
          }
      );
  })
}

exports.handler = (event, context, callback) => {
  
  const env_bucket = process.env.CONFIG_BUCKET
  const env_object = process.env.CONFIG_OBJECT
  
  const fileBucket = event.Records[0].s3.bucket.name
  const fileObject = event.Records[0].s3.object.key
  
  getS3File(env_bucket, env_object).then (function (fileData) {
    let mailInfo = JSON.parse(fileData.Body)
    const {from, subject, html, to, filename, path} = mailInfo

    getS3File(fileBucket, fileObject).then(function (reportData) {
      const contentBody = reportData.Body
      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html, //`<p>${env_bucket} ${env_object}</p>`,
        attachments: [
          {
            filename: "report.csv",
            content: contentBody
          }
        ]
      };

      // Initialize Nodemailer SES transporter
      const transporter = nodemailer.createTransport({
        SES: ses
      });
  
        // Send email and log messages for error checking
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email");
          callback(error);
        } else {
          console.log("Email sent successfully");
          callback();
        }
      });
   })
  })
};