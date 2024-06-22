# Lum Network - Millions

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/lum-network/millions/pulls)

This is the front-end repository for **Cosmos Millions**.

This service uses **Lum Network - Chain** (code hosted [here](https://github.com/lum-network/chain))

## Description

This service is a React full typescript v4 application with these main libraries:

- [Lum Network SDK](https://github.com/lum-network/lumjs)
- [CosmJS](https://github.com/cosmos/cosmjs) (amino, proto-signing and stargate packages)
- [Redux](https://react-redux.js.org/) and [Rematch](https://rematchjs.org/)
- [Class-transformer](https://github.com/typestack/class-transformer)
- [Dayjs](https://github.com/iamkun/dayjs)
- [Numeral](https://github.com/adamwdraper/Numeral-js)
- [Axios](https://github.com/axios/axios)

All stylesheets are written in SASS with [Bootstrap 5](https://getbootstrap.com/).

## Installation

**Prerequisites**: Make sure to have [Node >= 16.18](https://nodejs.org/)

### Clone

Clone the project with:

> $ git clone git@github.com:lum-network/millions.git

### Install dependencies and cp env file

Install dependencies with:

> $ yarn

Copy the `.env.prod` file to `.env`

> $ cp .env.prod .env

### Running your app

Now you can run your app with:

> $ yarn start

### Building your app

You can build your app with:

> $ yarn build

## Code Style

All React components are functional components with hooks.

There is a Prettier and ES Lint configuration to follow.

## Contributing

All contributions are more than welcome! Feel free to fork the repository and create a Pull Request!

Please also make sure to have a look to the [contributing guidelines](https://github.com/lum-network/millions/blob/master/CONTRIBUTING.md)
