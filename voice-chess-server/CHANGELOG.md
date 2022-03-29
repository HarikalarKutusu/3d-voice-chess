# CHANGELOG for Voice Chess Server

## [0.1.6] - 2022.03.29

- Reverted server.js to HTTP to make it work on Heroku server (on Heroku, load balancers remove SLL layer and connect to dyno using http)

## [0.1.5] - 2022.03.25

- created server.js as HTTPS and made it default
- Prevented connection of users if it is in use

## [0.1.4] - 2022.03.24

- Made it working with multiple languages, single user/stream
- Has errors in case of client drops

## [0.1.3] - 2022.03.24

- Created index.js (http) for heroku deployment, with host=0.0.0.0 & process.env.PORT
- Updated package.json
- Tested OK

## [0.1.2] - 2022.03.20

- Added - Can send language code as argument
- Added - Mechanism for client language request - response

## [0.1.1] - 2022.03.15

- Added - Simple adaptation for serving multiple models, needs code change & restart

## [0.1.0]

Initial source from Coqui repositories.
