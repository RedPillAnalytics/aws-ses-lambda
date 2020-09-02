const aws = require('aws-sdk');
const nodemailer = require("nodemailer");
const fetch = require('node-fetch')

const ses = new aws.SES({region: 'us-east-1'});

exports.handler = (event, context, callback) => {
  // Direct URL to the raw mailOptions JSON file 
  // Could/should store URL in AWS environment variables for each individual function
  let url = "https://raw.githubusercontent.com/redpillanalytics/email-repo/master/mailOptions.json" // Can store this in Lambda function env variables

  let settings = {method: 'GET'}

  // GET mailOptions from repo and construct the email from those options
  // Could do some error checking in this area using the event/context return values
  //   could compare against the file uploaded to S3 to the name of the repo to ensure
  //   we get the right file sent
  fetch(url, settings).then(response => {
    const {from, subject, html, to, filename, path} = response.body

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
};