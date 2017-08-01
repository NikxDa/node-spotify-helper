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

// Create a new instance
const webHelper = new SpotifyWebHelper ();

webHelper
    .connect () // Connect
    .then (() => {
        return webHelper.status (); // Request status
    })
    .then ((status) => {
        console.log (status.playing); // Music playing?
        if (status.playing)
            return webHelper.pause (); // Pause
        else
            return webHelper.play (); // Play          
    })
    .then ((status) => {
        console.log (status.playing); // Music still playing?
    });
```

## License
MIT
