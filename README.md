A RESTful api built in express/nodejs that takes a google gmail account as the sender and will send contents received from endpoint. Uses nodemailer to send email over SMTP.

Use the .env.template file for reference of .env values.

This application supports development,staging, and production environments. Dev & Stg will send all emails to the correlated .env file variable.

.env file names per env:
Development: .env.development
Staging: .env.staging
Production: .env.production

The App password is NOT the password you use to login to your account. These are issued by google and require 2 Step Verification on your account before they can be issued. You can visit https://myaccount.google.com/security to setup 2 step verification. After this has been setup, you can type "App Passwords" into the search bar and select "App Passwords" from the suggestions. Enter an application name and click create. Copy and paste this key into all .env files you will be using as the APP_PASSWORD variable.