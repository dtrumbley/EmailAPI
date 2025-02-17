//dependencies
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nm = require("nodemailer");

//setting .env file path for varying email recipients
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "staging"
    ? ".env.staging"
    : ".env.development";

dotenv.config({ path: path.resolve(__dirname, envFile) });
const app = express();
//integrating cors into app
app.use(cors());
app.use(express.json());

//setting bool to indicate if in testing environment
const isTestingEnv = process.env.NODE_ENV === "production" ? false : true;

const transporter = nm.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.APP_PASSWORD,
  },
});

// GET endpoint for status check

app.get("/api/email/status", (req, res) => {
  console.log("Status check hit");
  res.json({ status: "ok" });
});

app.post("/api/email/send", (req, res) => {
  //log api hit
  console.log(
    `POST /api/email/send hit with body: ${JSON.stringify(req.body)}`
  );
  //destructure body
  const {
    recipient = null,
    cc = "",
    bcc = "",
    subject = "",
    body = "",
    isHTML = false,
  } = req.body;
  //handle empty recipient
  if (!recipient || recipient.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Recipient email address is required" });
  }

  //add original recipient(s) to body when in testing environment
  /*
    how the testing email will read:
    Original recipient(s):
    To: recipient email
    //the following lines are conitional on whether they were sent to the api
    CC: cc email
    BCC: bcc email
  
    emailBody
  */
  const emailBody = isTestingEnv
    ? isHTML
      ? `Original recipient(s):<br>To: ${recipient}${
          cc.length > 0 ? `<br>CC: ${cc}`: ""
        }${bcc.length > 0 ? `<br>BCC: ${bcc}`:""}<br><br>${body}`
      : `Original recipient(s):\nTo: ${recipient} ${
          cc.length > 0 ? `\nCC: ${cc}`: ""
        }${bcc.length > 0 ? `\nBCC: ${bcc}`: ""}\n\n${body}`
    : body;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    //if in testing environment, only send to email address in .env file
    to: isTestingEnv ? process.env.EMAIL_TO : recipient,
    cc: isTestingEnv ? null : cc || null,
    bcc: isTestingEnv ? null : bcc || null,
    subject: subject || null,
    text: isHTML ? null : emailBody,
    html: isHTML
      ? `<html>
            <body>
                <p>
                  ${emailBody}
                </p>
            </body>
        </html>`
      : null,
  };

  //send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Error sending email: ${error}`);
      return res
        .status(500)
        .json({ success: false, message: "Error sending email" });
    }
    console.log(`Email sent successfully: ${info.response}`);
    //only return bool & no message if successful
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 5502;

app.listen(PORT, () => {
  console.log(`${process.env.NODE_ENV} email server running on port ${PORT}`);
});