# NodeJS Spotify Helper
The sweetest Spotify helper out there. Includes SpotifyWebHelper and the public Spotify API. Actively maintained!

[![NPM](https://nodei.co/npm/node-spotify-helper.png)](https://npmjs.org/package/node-spotify-helper)

## Installation
```
$ npm install node-spotify-helper
```

## Tabe of Contents
1. [Quick Start](#quick-start)
2. [Available APIs](#available-apis)
    1. [Web API](#web-api)
    2. [WebHelper API](#webhelper-api)
    3. [AppleScript API](#applescript-api)
3. [Issues](#issues)
4. [Improve these docs](#improve-these-docs)
5. [License](#license)

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

## Web API
The class `NodeSpotify.SpotifyWebApi` can be used to query the public Spotify Web Api. Note that this wrapper currently only supports public functionality, no private actions such as a user's playlists or songs.

Create a new instance:
```js
const NodeSpotify = require ("node-spotify-helper");
const webApi = new NodeSpotify.SpotifyWebApi ();
```

#### authenticate (clientId, clientSecret)
Example:
```js
await webApi.authenticate ("XXXX", "YYYY");
```

ClientId and ClientSecret can be obtained via Spotify, where an application needs to be added manually.
For further information, visit [this Spotify site](https://developer.spotify.com/my-applications/).
This function has to be called before any other function in order for them to work properly. An error will be thrown when calling any other function before authenticating.

#### search (text, type, limit = 20, offset = 0, retry = false)
Searches the Spotify Web Api and returns the raw JSON result.

Example:
```js
await webApi.search ("Calvin Harris", "track");
```


#### searchTracks (text, limit, offset)
A wrapper for search() which returns a beautified list of tracks.

Example:
```js
const tracks = await webApi.searchTracks ("Calvin Harris"); // Same as above
```

Return value format:
```
[{
    album: {
        name: String,
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
A wrapper for search() which returns a beautified list of playlists.

Example:
```js
const playlists = await webApi.searchPlaylists ("Charts");
```

Return value format:
```
[{
    name: String,
    trackCount: Number,
    uri: String
}]
```


#### searchArtists (text, limit, offset)
A wrapper for search() which returns a beautified list of artists.

Example:
```js
const artists = await webApi.searchArtists ("Katy Perry");
```

Return value format:
```
[{
    name: String,
    popularity: Number,
    genres: [String],
    followers: Number,
    uri: String
}]
```

## WebHelper API
The class `NodeSpotify.SpotifyWebApi` can be used to query the public Spotify Web Api. Note that this wrapper currently only supports public functionality, no private actions such as a user's playlists or songs.

Create a new instance:
```js
const NodeSpotify = require ("node-spotify-helper");
const webApi = new NodeSpotify.SpotifyWebApi ();
```


## AppleScript API
This will follow soon. Head over to the code and take a look yourself.

## Issues
If you find any issues with this library, please head over to [GitHub](https://github.com/NikxDa/node-spotify-helper) and submit an issue there. As this library is actively maintained, I'll do my best to fix errors as quickly as possible.

## Improve these docs
If you have time and want to help this project, feel free to add to these docs. Every contributer will be listed here.

## License
MIT
