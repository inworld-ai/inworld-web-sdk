# inworld-nodejs-generate-token

This example project contains a server that uses the Inworld API Key and Secret to generate an authorization token to access Inworld.

It's important to note that this service is easily run on localhost or on a non-ssl based production server. This service can be easily deployed by using the template of this project on [Railway.app](https://railway.app). More information can be found in the [Railway.app Service Setup](#railway-setup) section.

If you require to host the project on your own dedicated platform and need SSL or HTTPS you will need to follow the [SSL/HTTPS Server Setup](#server-setup) documentation.

<br>

## Table of Contents

- [Requirements](#requirements)
- [Instructions](#instructions)
- [Environment Variables](#env)
- [Railway.app Service Setup](#railway-setup)
- [Dedicated SSL/HTTPS Server Setup](#server-setup)

<br>

## Requirements <a id="requirements" name="requirements"></a>

- Node version 16+
- NPM version 8.19.4+
- Yarn version 1.22.19+
- [Inworld Integration API Key and Secret](https://studio.inworld.ai/)
- [An Inworld Scene ID](https://studio.inworld.ai/)
- (Optional) A [Railway.app](https://railway.app) account for quickly deploying the service.
- (Optional) A SSL Key/Cert for dedicated hosting servers [Why do I need this?](#server-setup)

<br>

## Instructions <a id="instructions" name="instructions"></a>

If you are setting this project up locally or on a remote server follow these instructions. If you're using an automatic hosting service like, [Railway.app](https://railway.app), you will not need to perform this but review the list of [Environment Variables](#env) to know how to setup the service. If you use automated hosting services which don't allow for a `.env` file to be created to store your Environment Variables you will need to use the `NOENV` environment variable defined in the [Environment Variables](#env) section.

1. From the project directory type `yarn install` to download and install the project dependencies.
1. Copy the `.env-sample` file to `.evn`.
1. Open the `.env` file in an editor and enter your Inworld API Key, Secret and Scene ID after the `INWORLD_KEY`, `INWORLD_SECRET` and `INWORLD_SCENE` fields respectively.
1. If you wish to configure the port, set SSL keys follow the list of available environment variables [here](#env)
1. Save and close the file.
1. If you are using this server in SSL/HTTPS mode follow the instructions [here](#server-setup) then follow the next step.
1. Launch the application by typing in `yarn start`.

<br>

## Environment Variables <a id="env" name="env"></a>

The following are the list of Environment Variables this project supports:

| Name           | Type    | Description                                                        | Requirement                        |
| -------------- | ------- | ------------------------------------------------------------------ | ---------------------------------- |
| INWORLD_KEY    | String  | The Inworld Workspace Integration API Key.                         | Required                           |
| INWORLD_SECRET | String  | The Inworld Workspace Integration API Secret.                      | Required                           |
| INWORLD_SCENE  | String  | The Inworld Scene ID .                                             | Required                           |
| PORT           | Number  | The port to run the server on.                                     | Optional, defaults to 4000         |
| USE_SSL        | Boolean | Set to true if SSL keys are needed.                                | Optional                           |
| SSL_KEY_NAME   | String  | The name of the SSL key file located in the `keys` folder.         | Required only if USE_SSL is `true` |
| SSL_CERT_NAME  | String  | The name of the SSL certificate file located in the `keys` folder. | Required only if USE_SSL is `true` |
| NOENV          | Any     | Use if this service is deployed without an .env file.              | Optional                           |

<br>

## Railway.app Service Setup <a id="railway-setup" name="railway-setup"></a>

The following is are the instructions for setting up the Inworld Generate Token project easily using the service [Railway.app](https://railway.app/). The service requires a GitHub account and will clone this repo into the account.

<br>

1. Goto the [Inworld Token Generator](https://railway.app/template/FIgbO1?referralCode=kc8zVG) template page on Railway.app and click on the **Deploy Now** button.

---

![Railway.app Dashboard Homepage](./imgs/img-1-a.png 'Railway.app Dashboard Homepage')

<br>

2. Fill out the `INWORLD_KEY`, `INWORLD_SECRET` and `INWORLD_SCENE` fields respectively and click on the **Deploy** button. Information on these can be found in the [Environment Variables](#env) section.

---

![Railway.app Template Deploy](./imgs/img-1-b.png 'Railway.app Template Deploy')

<br>

3. The service will now deploy and wait until it says Success to know when it's live. If you run into any issues click on the **View Logs** button and see if errors appear in them.

---

![Railway.app Template Deploy](./imgs/img-1-c.png 'Railway.app Template Deploy')

<br>

4. Click on the **Settings** tab and scroll down to **Domains**. Click on the **Generate Domain** button

---

![Railway.app Domain Settings](./imgs/img-1-d.png 'Railway.app Domain Settings')

<br>

5. A public facing domain will now be created for the service.

---

![Railway.app Domain Settings](./imgs/img-1-e.png 'Railway.app Domain Settings')

<br>

6. Test the domain by opening it in your web browser. You should see a successful JSON token response.

---

![Service Token Response](./imgs/img-1-f.png 'Service Token Response')

<br>

## Dedicated SSL/HTTPS Server Setup <a id="server-setup" name="server-setup"></a>

Do to modern security requirements for browsers, if you run the Inworld Web SDK from an external or Production service that uses SSL/HTTPS you will need to setup the this project on a service that can allow HTTPS OR you need a SSL Key/Certificate.

Heroku is a known service that allows for automatic SSL/HTTPS services.

If you have your own SSL Key/Certificate you will need to setup this service the following way.

In you `.env` file you've setup previously, change the `USE_SSL` field to `true`. Copy your ssl key and certificate to the `./keys` folder found at the root of this project. In the `.env` file update the `SSL_KEY_NAME` and `SSL_CERT_NAME` fields to reflect the names of those files you copied.

When you run this project using `yarn start` it should now be using SLL on the domain name the SSL keys were created for.

<br>
