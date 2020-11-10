require('dotenv').config();
const aws = require('aws-sdk');
const nodemailer = require("nodemailer");

const ses = new aws.SES({region: 'us-east-1'});
const dynamo = new aws.DynamoDB.DocumentClient();
const s3 = new aws.S3();

/**
 * Retrieves the S3 report object that triggered the Lambda function and allows the code to store it in a variable
 *  to use as an email attachment option.
 * 
 * @param {string} bucket The bucket that contains the S3 report object.
 * @param {string} key The key of the S3 report object.
 * @return Returns the file body in a buffer 
 */
async function downloadFromS3(bucket, key) {
  const file = await s3.getObject({Bucket: bucket, Key: key}).promise()
  return file.Body
}

exports.handler = async (event, context, callback) => {
  
  const fileBucket = event.Records[0].s3.bucket.name
  const fileObject = event.Records[0].s3.object.key

  /**
   * DynamoDB parameters that will be used to retrieve email configurations containing
   *  information about email specifics (can/maybe should store these in environment variables)
   * 
   * @param {string} table The table that contains the email configurations.
   * @param {string} trigger_item The specific item in the table to get email configurations.
   */
  const table = process.env.TABLE
  const trigger_item = process.env.TRIGGER

  const params = {
      TableName: table,
      Key: {
          report: trigger_item
      }
  }

  try {
    
    let attachment = await downloadFromS3(fileBucket, fileObject)
    let data = await dynamo.get(params).promise()

    if (data) {
      let mailInfo = data.Item.mailInfo
      const {from, subject, html, to, filename} = mailInfo
      
      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html,
        attachments: [
          {
            filename: filename,
            content: attachment
          }
        ]
      };
      
      /**
       * Initialize the Nodemailer transporter with a configuration to use an instance of SES
       */
      const transporter = nodemailer.createTransport({
        SES: ses
      });
      
      let info = await transporter.sendMail(mailOptions)
      
      console.log(`Message sent: ${info.messageId}`)
    }
  } catch (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
  }
};