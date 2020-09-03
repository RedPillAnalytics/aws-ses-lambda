const aws = require('aws-sdk');
const nodemailer = require("nodemailer");
const https = require('https');

const ses = new aws.SES({region: 'us-east-1'});

exports.handler = (event, context, callback) => {
  // Direct URL to the raw mailOptions JSON file 
  // Could/should store URL in AWS environment variables for each individual function
  let body = []
  let url = "https://raw.githubusercontent.com/RedPillAnalytics/aws-lambda/master/mailOptions.example.json?token=AC44LDKOJ7OTD6GEZB6F7627LFBP4"

  // GET mailOptions from repo and construct the email from those options
  // Could do some error checking in this area using the event/context return values
  //   could compare against the file uploaded to S3 to the name of the repo to ensure
  //   we get the right file sent
  https.request(url, res => {
    res.on('data', chunk => body.push(chunk))
    res.on('end', () => {
      let mailInfo = JSON.parse(Buffer.concat(body))
      const {from, subject, html, to, filename, path} = mailInfo

      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html,
        attachments: [
          {
            filename: filename,
            path: path
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
  }).end()
};