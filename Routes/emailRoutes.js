const express = require('express');
const nodemailer = require('nodemailer');
const { User } = require("../models/user");
const bcrypt = require("bcrypt")
const router = express.Router();

function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: 'Floraison',
      html: `<!DOCTYPE html>
      <html lang="en" >
      <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
        
      
      </head>
      <body>
      <!-- partial:index.partial.html -->
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #3bb19b;text-decoration:none;font-weight:600">Floraison</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Thank you for choosing Floraison. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
          <h2 style="background: #3bb19b;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
          <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          </div>
        </div>
      </div>
      <!-- partial -->
        
      </body>
      </html>`,}

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: 'An error has occurred' });
      }
      return resolve({ message: 'Email sent successfully' });
    });
  });
}

const verifyUserByEmail = async (recipient_email) => {
  try {
    const user = await User.findOne({ email: recipient_email });

    if (user) {
      return true;
    } else {
      return { message: 'User not found' };
    }
  } catch (error) {
    throw new Error('An error occurred while verifying the user.');
  }
};

// Example usage




router.post('/send_recovery_email', async (req, res) => {
  const recipient_email = req.body.recipient_email;

  try {
    const userExists = await verifyUserByEmail(recipient_email);

    if (userExists === true) {
      const response = await sendEmail(req.body);
      res.send(response.message);
    } else {
      res.status(400).send("User not verified.");
    }
  } catch (error) {
    res.status(500).send("An error occurred.");
  }
});

router.put('/reset', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)

  try {
    const user = await User.findOne({ email: email });
    console.log(user);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    await user.save();

    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});



module.exports = router;
