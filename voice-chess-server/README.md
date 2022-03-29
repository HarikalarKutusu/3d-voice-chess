# Voice Chess Server

A multi-language Speech to Text (Coqui STT) server implementation for 3D Voice Chess playing.

## Current Capabilities

- Multiple languages (currently de, en, tr)
- Single user

If the server is in use by a user (socket.io connection) connection requests are denied and disconnected.

This is currently due to limited server resources. STT processes are resource intensive and each connection would require a separate worker running on another core, maybe using node clusters etc.

Currently production environment is compatible with a free Heroku dyno. (Note: Heroku uses load balancers which convert incoming HTTPS to HTTP to be used for dynos, so we use HTTP server on production environment.)

TODO: There is a huge to-do list here.

- Convert to Typescript (node-vas has no typings)
- Implement multi-core/cluster code
- Reduce audio streaming by pre-examining audio on the client and release server resources if not used (e.g. Walkie-Talkie style push and speak or VAD detection). We may like to assign a worker/core to a language and queue client STT requests also.
- Find a host to implement/test these...
