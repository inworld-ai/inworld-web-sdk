# Inworld Generate Token

This example project contains a server that uses the Inworld API Key and Secret to generate an authorization token to access Inworld.

It's important to note that this service is easily run on localhost or on a non-ssl based production server. If you use SSL or HTTPS you will need to follow the [SSL/HTTPS Server Setup](#server-setup) documentation.

<br>

## Table of Contents
---
- [Requirements](#requirements)
- [Instructions](#instructions)
- [SSL/HTTPS Server Setup](#server-setup)

---

<br>

## Requirements
- Node version 16+
- NPM version 8.19.4+
- Yarn version 1.22.19+
- [Inworld Integration API Key and Secret](https://studio.inworld.ai/)
- (Optional) SSL Key for remotly hosted servers [Why do I need this?](#ssl)

<br>

## Instructions <a id="instructions" name="instructions"></a>
---

1. From the project directory type `yarn install` to download and install the project dependencies.
1. Copy the `.env-sample` file to `.evn`.
1. Open the `.env` file in an editor and enter your Inworld API Key and Secret after the `INWORLD_KEY` and `INWORLD_SECRET` fields respectively. Save and close the file.
1. Launch the application by typing in `yarn start`.

<br>

## SSL/HTTPS Server Setup <a id="server-setup" name="server-setup"></a>
---

Do to modern security requirements for browsers, if you run the Inworld Web SDK from an external or Production service that uses SSL/HTTPS you will need to setup the this project on a service that can allow HTTPS OR you need a SSL Key/Certificate. 

Heroku is a known service that allows for automatic SSL/HTTPS services.

If you have your own SSL Key/Certificate you will need to setup this service the following way.

In you `.env` file you've setup previously, change the `USE_SSL` field to `true`. Copy your ssl key and certificate to the `./keys` folder found at the root of this project. In the `.env` file update the `SSL_KEY_NAME` and `SSL_CERT_NAME` fields to reflect the names of those files you copied. 

When you run this project using `yarn start` it should now be using SLL on the domain name the SSL keys were created for.




