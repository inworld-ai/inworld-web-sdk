# Inworld Generate Token

This example project contains a server that uses the Inworld API Key and Secret to generate an authorization token to access Inworld.

<br>

## Table of Contents
---
- [Requirements](#requirements)
- [Instructions](#instructions)
- [HTTPS Server Setup](#server-setup)

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

## HTTPS Server Setup <a id="server-setup" name="server-setup"></a>
---

Do to modern security requirements for browsers 




