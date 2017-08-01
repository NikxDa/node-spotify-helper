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

async function run () {
    // Create a new instance
    const webHelper = new SpotifyWebHelper ();
    await webHelper.connect ();

    // Do stuff
    await webHelper.status ();
    await webHelper.play ();
    await webHelper.pause ();
    await webHelper.volume ();
    ...

    // Terminate the process
    process.exit (0);
}

// Run the async function
run ();
```

## License
MIT
