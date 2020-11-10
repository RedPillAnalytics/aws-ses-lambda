# Lambda Email Reports
Automating email reports

### AWS Services Used
SES, Lambda, S3, Dynamo

### Permissions
This function will need the following permissions:
- Lambda - basic execution role
- SES - write
- S3/DynamoDB - read

### Function Overview
The function relies on an S3 object to be its trigger. The file that triggers the function should be the report that needs to be emailed. That file will be retrieved and added as an attachment to the outgoing email.

DynamoDB houses different email configurations that will be used for each report and is how the code will differentiate between what reports will be sent.

### Setup Overview (excludes permissions)
There are four parts to setup to get the code to run properly (excluding the setup for permissions)
1. SES email verfication
2. DynamoDB table setup and email information configs
3. S3 bucket setup
4. Lambda code deployment and environment variable handling

#### SES Email Verification (verifying identities)
Be aware that there are some soft limits on SES and requesting beyonds those limits may be required, those limits can be found [here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html)

Email verification steps are simple, go into the SES section of AWS and there will be a prompt to verify your sender email.

#### DynamoDB Table and Configurations Setup
Currently the function is setup to read email configurations that are configured like the example below, changes can be made to this with very little resistance.

```
{
  "mailInfo": {
    "filename": "account.csv",
    "from": "sender@email.com",
    "subject": "Report: account.csv",
    "to": [
      "recipient@email.com"
    ]
    "body": <p>HTML BODY HERE</p>
  },
  "report": "account.csv"
}
```

#### S3 Bucket Setup
There is total freedom on the S3 bucket setup as long as the function is able to use it as a trigger, this bucket will be where you want to upload reports that will need to be sent out to recipients.

#### Lambda Code Deployment and Environment Variable Handling
This part will be straightforward as well:

1. Download code from GitHub and run `npm i` to download the packages the code needs to operate
2. Zip up the contents of the folder and not the folder itself (go into the folder, select the contents of the folder e.g. index.js, node_modules, package.json etc and zip that)
3. In the AWS Lambda setup page, upload from zip.
4. Setup the trigger by selecting the S3 bucket and ensuring that the trigger will be sent on every object creation event
5. Setup the environment variables so the code knows which email configuration to retrieve, below are the available environment variables (there is a section in the Lambda function configration page that allows for env variable management)

*table* - the table that holds the email configurations

*trigger* - the item that holds the email specific email configuration




