# NodeJS Spotify Helper
The sweetest Spotify helper out there. Includes SpotifyWebHelper and the public Spotify API. Actively maintained!

## Installation
```
npm install node-spotify-helper
```

## Tabe of Contents
1. [Quick Start](#quick-start)
2. [Available APIs](#available-apis)
    1. [Web API](#web-api)
    2. [WebHelper API](#webhelper-api)
    3. [AppleScript API](#applescript-api)
3. Issues
4. Improve these docs
5. License

## Quick Start
```js
// Require the Spotify Web Helper
const NodeSpotify = require ("node-spotify-helper");

// Create a new instance
const webHelper = new NodeSpotify.SpotifyWebHelper ();

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

## Available APIs
Currently, the NodeJS Spotify Helper exposes three APIs. The Web API queries the public Spotify Api (requires a clientId and a clientSecret). The Web Helper API controls the local SpotifyWebHelper executable. The AppleScript API uses AppleScript to control the Spotify Application directly (macOS/OSX only). Every API is written in ES6, completely commented and uses Promises for nearly all functions. Goodbye callback hell!

### Web API
The class `NodeSpotify.SpotifyWebApi` can be used to query the public Spotify Web Api. Note that this wrapper currently only supports public functionality, no private actions such as a user's playlists or songs. The available methods are:

#### authenticate (clientId, clientSecret)
Example: `await webApi.authenticate ("XXXX", "YYYY");`
ClientId and ClientSecret can be obtained via Spotify, where an application needs to be added manually. For further information, visit [the Spotify Site](https://developer.spotify.com/my-applications/). This function has to be called before any other function in order for them to work properly. An error will be thrown when calling any other function before authenticating.

#### search (text, type, limit = 20, offset = 0, retry = false)
Example: `await webApi.search ("Calvin Harris", "track")`
Searches the Spotify Web Api and returns the raw JSON result.

#### searchTracks (text, limit, offset)
Example: `await webApi.searchTracks ("Calvin Harris") // Same as above`
Wrapper for search. Returns a list of beautified Spotify tracks in the form of:
```
[{
    album: {
        name: String      ,
        uri: String
    },
    artists: [String],
    duration: Number,
    uri: String,
    popularity: Number,
    name: String
}]
```

#### searchPlaylists (text, limit, offset)
Example: `await webApi.searchPlaylists ("Charts")`
Wrapper for search. Returns a list of beautified Spotify playlists in the form of:
```
[{
    name: String,
    trackCount: Number,
    uri: String
}]
```

#### searchArtists (text, limit, offset)
Example: `await webApi.searchArtists ("Katy Perry")`
Wrapper for search. Returns a list of beautified Spotify artists in the form of:
```
[{
    name: String,
    popularity: Number,
    genres: [String],
    followers: Number,
    uri: String
}]
```

### WebHelper API
This will follow soon. Head over to the code and take a look yourself.

### AppleScript API
This will follow soon. Head over to the code and take a look yourself.

## Issues
If you find any issues with this library, please head over to [GitHub] and submit an issue there. As this library is actively maintained, I'll do my best to fix errors as quickly as possible.

## Improve these docs
If you have time and want to help this project, feel free to add to these docs. Every contributer will be listed here.

## License
MIT
