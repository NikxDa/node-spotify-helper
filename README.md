# NodeJS Spotify Helper
The sweetest Spotify helper out there. Includes SpotifyWebHelper, AppleScript and the public Spotify API. Actively maintained!

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
const webHelper = new NodeSpotify.SpotifyWebHelper ();
```


#### connect ()
Obtains the port on which the SpotifyWebHelper is running and builds a URI out of it. Further obtains authentication tokens and saves them to use for the other functions. Returns the connection URI.

Example:
```js
const uri = await webHelper.connect ();
// -> https://127.0.0.1:4370/
```


#### getTokens ()
Internally called by connect, but might be useful for other actions not included in this API. *You will not need this function to use the API*. Returns a CSRF-Token and an OAuth-Token to query the SpotifyWebHelper.

Example:
```js
const uri = await webHelper.connect ();
```

Return value format:
```
{
    oAuth: String,
    csrf: String
}
```


#### play (uri, context = "")
Play a Spotify URI, optionally in a context (album or playlist URI).

Example:
```js
await webHelper.play ("spotify:track:4uLU6hMCjMI75M1A2tKUQC");
```


#### pause (state = true)
Pause (or unpause) the current playback.

Example:
```js
await webHelper.pause ();
```


#### unpause ()
Wrapper for pause (), which unpauses the playback if it's paused.

Example:
```js
await webHelper.unpause ();
```


#### status ()
Gets the current status from the SpotifyWebHelper and returns a beautified result.

Example:
```js
const status = await webHelper.status ();
```

Return value format:
```
{
    playing: Boolean,
    volume: Number,
    time: Number,
    current: {
        track: {
            name: String,
            uri: String,
            link: String
        },
        artist: {
            name: String,
            uri: String,
            link: String
        },
        album: {
            name: String,
            uri: String,
            link: String
        }
    }
}
```


#### rawStatus ()
Gets the current status from the SpotifyWebHelper but returns the raw result received.

Example:
```js
const raw = await webHelper.rawStatus ();
```


#### isEnabled ()
Checks which buttons are enabled and returns the information.

Example:
```js
const nextEnabled = (await webHelper.isEnabled ()).nextTrack;
```

Return value format:
```
{
    previousTrack: Boolean,
    playPause: Boolean,
    nextTrack: Boolean
}
```


#### information ()
Returns version information of the SpotifyWebHelper.

Example:
```js
const version = await webHelper.information ();
// -> { version: String, clientVersion: String }
```


#### isPlaying ()
Checks whether the client is currently playing music.

Example:
```js
const isPlaying = await webHelper.isPlaying ();
// -> Boolean
```


#### isShuffling ()
Checks whether the client's shuffle mode is currently enabled.

Example:
```js
const isShuffling = await webHelper.isShuffling ();
// -> Boolean
```


#### isRepeating ()
Checks whether the client's repeating mode is currently enabled.

Example:
```js
const isRepeating = await webHelper.isRepeating ();
// -> Boolean
```


#### volume ()
Retrieves the current client volume. This value is read-only because the WebHelper does not allow volume changes.

Example:
```js
const volume = await webHelper.volume ();
// -> Number
```


## AppleScript API
The class `NodeSpotify.SpotifyAppleScriptApi` can be used to directly interact with the Spoitify application on macOS/OSX. Since this functionality requires macOS/OSX, the class will throw an error during construction and during every method call when on any other operating system.

Create a new instance:
```js
const NodeSpotify = require ("node-spotify-helper");
const appleScript = new NodeSpotify.SpotifyAppleScriptApi ();
```


#### play (uri, context = "")
Plays a URI, optionally in a context (artist or playlist URI). If no argument is supplied, the call will be treated as an unpause() call.

Example:
```js
await appleScript.play ("spotify:track:4uLU6hMCjMI75M1A2tKUQC");
```


#### pause ()
Pauses the client playback.

Example:
```js
await appleScript.pause ();
```


#### unpause ()
Resumes the client playback.

Example:
```js
await appleScript.unpause ();
```


#### currentTrack ()
Resumes the client playback.

Example:
```js
await appleScript.unpause ();
```

(Not fully documented)

## Issues
If you find any issues with this library, please head over to [GitHub](https://github.com/NikxDa/node-spotify-helper) and submit an issue there. As this library is actively maintained, I'll do my best to fix errors as quickly as possible.

## Improve these docs
If you have time and want to help this project, feel free to add to these docs. Every contributer will be listed here.

## License
MIT
