    const express = require('express');
    const app = express();
    const cors = require('cors');
    const nodemailer = require("nodemailer");

    const mongoose = require('mongoose');
    require('dotenv').config(); // Load environment variables from .env file
    const registeroute = require ("./Routes/register")
    const loginroute = require ("./Routes/auth")
    const emailroute = require ("./Routes/emailRoutes")
    const pfiniRoutes = require('./Routes/pfini'); // Replace with the actual path
    const mvtRoutes = require("./Routes/Mvt")
    const Nlotroutes = require('./Routes/nlot'); // Replace with the actual path

    const pfinidRoutes = require('./Routes/depot'); // Replace with the actual path

    const Nlotdroutes = require('./Routes/nlotdepot'); // Replace with the actual path

    const SourceRoutes = require('./Routes/source'); // Replace with the actual path
    const LRoutes = require('./Routes/livreur'); // Replace with the actual path
    const VRoutes = require('./Routes/vehicule'); 
    const FRoutes = require('./Routes/fournisseur'); // Replace with the actual path


    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    });
    // MongoDB connection options
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // MongoDB connection
    mongoose
      .connect(process.env.MONGODB_URI, mongooseOptions)
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
      });

    app.use(express.json());
    app.use(cors());



    function sendEmail({ recipient_email, OTP }) {
      return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MY_EMAIL,
            pass: process.env.MY_PASSWORD,
          },
        });

        const mail_configs = {
          from: process.env.MY_EMAIL,
          to: recipient_email,
          subject: " PASSWORD RECOVERY",
          html: `<!DOCTYPE html>
    <html lang="en" >
    <head>
      <meta charset="UTF-8">
      <title>CodePen - OTP Email Template</title>
      

    </head>
    <body>
    <!-- partial:inadex.partial.html -->
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you . Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
        <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Koding 101 Inc</p>
        </div>
      </div>
    </div>
    <!-- partial -->
      
    </body>
    </html>`,
        };
        transporter.sendMail(mail_configs, function (error, info) {
          if (error) {
            console.log(error);
            return reject({ message: `An error has occured` });
          }
          return resolve({ message: "Email sent succesfuly" });
        });
      });
    }

    app.get("/", (req, res) => {
      console.log(process.env.MY_EMAIL);
    });

    app.post("/send_recovery_email", (req, res) => {
      sendEmail(req.body)
        .then((response) => res.send(response.message))
        .catch((error) => res.status(500).send(error.message));
    });

    app.use("/api/login",loginroute)
    app.use("/api/email",emailroute)

    app.use('/api/pfini', pfiniRoutes);


    app.use('/api/nlot',Nlotroutes );

    app.use('/api/mvt', mvtRoutes);

    app.use('/api/depot', pfinidRoutes);
    app.use('/api/dnlot',Nlotdroutes );
    app.use('/api/source', SourceRoutes);
    app.use('/api/livreur', LRoutes);
    app.use('/api/vechicule', VRoutes);   
    app.use('/api/Fournisseur', FRoutes);

    app.use("/api/register",registeroute)

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
