# NodeJS Spotify Helper
The sweetest Spotify helper out there. Includes SpotifyWebHelper and the public Spotify API.

## Installation
```
npm install node-spotify-helper
```

## Quick Start
```js
// Require the Spotify Web Helper
const SpotifyWebHelper = require ("node-spotify-helper").SpotifyWebHelper;

// Create a new Instance
const webHelper = new SpotifyWebHelper ();

// Do stuff
await webHelper.status ();
await webHelper.play ();
await webHelper.pause ();
await webHelper.volume ();
...
```

## License
MIT
