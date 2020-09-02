const aws = require('aws-sdk');
const ses = new aws.SES({region: 'us-east-1'});
const nodemailer = require("nodemailer");
const fetch = require('node-fetch')

exports.handler = (event, context, callback) => {
  // Direct URL to the raw mailOptions JSON file
  let url = "https://raw.githubusercontent.com/redpillanalytics/email-repo/master/mailOptions.json" // Can store this in Lambda function env variables

  let settings = {method: 'GET'}

  // GET mailOptions from repo and construct the email from those options
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