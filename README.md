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

// Create a new instance of the API you want to use
const webHelper = new NodeSpotify.SpotifyWebHelper ();
const appleScript = new NodeSpotify.SpotifyAppleScriptApi ();
const webApi = new NodeSpotify.SpotifyWebApi ();
```



## Available APIs

Currently, the NodeJS Spotify Helper exposes three APIs. 

- The *Web API* queries the public Spotify Api (requires a clientId and a clientSecret). 
- The *Web Helper API* controls the local SpotifyWebHelper executable. 
- The *AppleScript API* uses AppleScript to control the Spotify Application directly (macOS/OSX only). 

Every API is written in ES6, completely commented and uses Promises for nearly all functions. Goodbye callback hell!



## Web API
The class `NodeSpotify.SpotifyWebApi` can be used to query the public Spotify Web Api. Note that this wrapper currently only supports public functionality, no private actions such as a user's playlists or songs.

*Create a new instance:*
```js
const NodeSpotify = require ("node-spotify-helper");
const webApi = new NodeSpotify.SpotifyWebApi ();
```



### Quick Start

A really small sample code to get you going. This code authenticates with the Spotify Web Api and then queries it for artists by the name of `Jackson 5`.

```js
async function webApiDemo () {
  // Connect to the Web Api using your clientId and clientSecret
  await webApi.authenticate ("clientId", "clientSecret"); 
  
  // Run a query
  const artists = await webApi.searchArtists ("Jackson 5");
}

webApiDemo (); // Call the async function
```



### Available methods

The following methods are available on an instance of `SpotifyAppleScriptApi`:

```
authenticate (clientId, clientSecret)
search (text, type, [limit=20], [offset=0], [retry=false])
searchArtists (text, [limit=20], [offset=0])
searchTracks (text, [limit=20], [offset=0])
searchPlaylists (text, [limit=20], [offset=0])
```



#### authenticate (clientId, clientSecret)

Authenticates the client on the Spotify Web Api.

*Example:*
```js
await webApi.authenticate ("XXXX", "YYYY");
```

*Note:*

ClientId and ClientSecret can be obtained via Spotify, where an application needs to be added manually.
For further information, visit [this Spotify site](https://developer.spotify.com/my-applications/). This function has to be called before any other function in order for them to work properly. An error will be thrown when calling any other function before authenticating.



#### search (text, type, [limit = 20], [offset = 0], [retry = false])

Searches the Spotify Web Api and returns the raw JSON result.

*Example:*
```js
await webApi.search ("Calvin Harris", "track");
```



#### searchTracks (text, [limit = 20], [offset = 0])

A wrapper for search() which returns a beautified list of tracks.

*Example:*
```js
const tracks = await webApi.searchTracks ("Calvin Harris"); // Same as above
```

*Return value format:*
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



#### searchPlaylists (text, [limit = 20], [offset = 0])

A wrapper for search() which returns a beautified list of playlists.

*Example:*
```js
const playlists = await webApi.searchPlaylists ("Charts");
```

*Return value format:*
```
[{
    name: String,
    trackCount: Number,
    uri: String
}]
```



#### searchArtists (text, [limit = 20], [offset = 0])

A wrapper for search() which returns a beautified list of artists.

*Example:*
```js
const artists = await webApi.searchArtists ("Katy Perry");
```

*Return value format:*
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

*Create a new instance:*
```js
const NodeSpotify = require ("node-spotify-helper");
const webHelper = new NodeSpotify.SpotifyWebHelper ();
```



### Quick Start

A really small sample code to get you going. This code fetches the authentication tokens from the SpotifyWebHelper and connects to it. After that, it pauses the current playback.

```js
async function webHelperDemo () {
  // Connect to the WebHelper
  await webHelper.connect ();
  
  // Pause the current playback
  await webHelper.pause ();
}

webHelperDemo (); // Call the async function
```



### Available Methods

The following methods are available for instances of `SpotifyWebHelperApi`:

```
connect ()
getTokens ()
play ([uri], [context = ""])
pause ([state = true])
unpause ()
status ()
rawStatus ()
isEnabled ()
information ()
isPlaying ()
isShuffling ()
isRepeating ()
volume ()
```



#### connect ()

Obtains the port on which the SpotifyWebHelper is running and builds a URI out of it. Further obtains authentication tokens and saves them to use for the other functions. Returns the connection URI.

*Example:*
```js
const uri = await webHelper.connect ();
// -> https://127.0.0.1:4370/
```



#### getTokens ()

Internally called by connect, but might be useful for other actions not included in this API. *You will not need this function to use the API*. Returns a CSRF-Token and an OAuth-Token to query the SpotifyWebHelper.

*Example:*
```js
const uri = await webHelper.connect ();
```

*Return value format:*
```
{
    oAuth: String,
    csrf: String
}
```



#### play ([uri], [context = ""])

Play a Spotify URI, optionally in a context (album or playlist URI). If no uri is supplied, the call will be interpreted as a call to `unpause()`.

*Example:*
```js
await webHelper.play ("spotify:track:4uLU6hMCjMI75M1A2tKUQC");
```



#### pause ([state = true])

Pause (or unpause) the current playback.

*Example:*
```js
await webHelper.pause ();
```



#### unpause ()

Wrapper for pause (), which unpauses the playback if it's paused.

*Example:*
```js
await webHelper.unpause ();
```



#### status ()

Gets the current status from the SpotifyWebHelper and returns a beautified result.

*Example:*
```js
const status = await webHelper.status ();
```

*Return value format:*
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

*Example:*
```js
const raw = await webHelper.rawStatus ();
```



#### isEnabled ()

Checks which buttons are enabled and returns the information.

*Example:*
```js
const nextEnabled = (await webHelper.isEnabled ()).nextTrack;
```

*Return value format:*
```
{
    previousTrack: Boolean,
    playPause: Boolean,
    nextTrack: Boolean
}
```



#### information ()

Returns version information of the SpotifyWebHelper.

*Example:*
```js
const version = await webHelper.information ();
// -> { version: String, clientVersion: String }
```



#### isPlaying ()

Checks whether the client is currently playing music.

*Example:*

```js
const isPlaying = await webHelper.isPlaying ();
// -> Boolean
```



#### isShuffling ()

Checks whether the client's shuffle mode is currently enabled.

*Example:*
```js
const isShuffling = await webHelper.isShuffling ();
// -> Boolean
```



#### isRepeating ()

Checks whether the client's repeating mode is currently enabled.

*Example:*
```js
const isRepeating = await webHelper.isRepeating ();
// -> Boolean
```



#### volume ()

Retrieves the current client volume. This value is read-only because the WebHelper does not allow volume changes.

*Example:*
```js
const volume = await webHelper.volume ();
// -> Number
```



## AppleScript API

The class `NodeSpotify.SpotifyAppleScriptApi` can be used to directly interact with the Spoitify application on macOS/OSX. Since this functionality requires macOS/OSX, the class will throw an error during construction and during every method call when on any other operating system.

*Create a new instance:*
```js
const NodeSpotify = require ("node-spotify-helper");
const appleScript = new NodeSpotify.SpotifyAppleScriptApi ();
```



### Quick Start

A small code snippet go get you going. The following code mutes and pauses the current playback and then brings up the Spotify window.

```js
async function appleSriptDemo () {
  // Mute and pause client
  await appleScript.mute ();
  await appleScript.pause ();
  
  // Activate the window
  await appleScript.focusWindow ();
}

appleScriptDemo (); // Call the async function
```



### Available methods

The following methods are available on an instance of `SpotifyAppleScriptApi`:

```
play ([uri, context])
playPause ()
pause ()
unpause ()
currentTrack ()
volume ([amount])
volumeUp ([amount = 10])
volumeDown ([amount = 10])
mute ()
unmute ()
shuffling ([mode])
repeating ([mode])
position ([time])
next ()
previous ()
focusWindow ()
isSpotifyRunning ()
```



#### play ([uri], [context])
Plays a URI, optionally in a context (artist or playlist URI). If no argument is supplied, the call will be treated as an unpause() call.

*Example:*
```js
await appleScript.play ("spotify:track:4uLU6hMCjMI75M1A2tKUQC");
```



#### playPause ()

Pauses the playback if currently running, otherwise resumes it.

*Example:*

```js
await appleScript.playPause ();
```



#### pause ()

Pauses the client playback. 

*Example:*
```js
await appleScript.pause ();
```



#### unpause ()

Resumes the client playback.

*Example:*
```js
await appleScript.unpause ();
```



#### currentTrack ()

Gets information about the current track.

*Example:*
```js
const track = await appleScript.currentTrack ();
```

*Return value format:*
```
{
    name: String,
    duration: Number,
    album: 'There For You',
    artist: 'Martin Garrix',
    disc_number: Number,
    track_number: Number,
    popularity: Number,
    id: String,
    artwork_url: String,
    album_artist: String,
    spotify_url: String
}
```



#### volume ([amount])

When `amount` is supplied, will set the client volume to `amount`. When `amount` is not supplied, the function will return the current client volume.

*Note:* 

This function is a wrapper for `getVolume ()` and `setVolume (mode)`, which can be used instead.

*Example:*

```js
const currentVolume = await appleScript.volume ();
await appleScript.volume (50) // Set volume to 50%
```



#### volumeUp ([amount = 10])

Increases the current client volume by `amount`. If the `amount` argument is not supplied, the volume will be increased by 10.

*Example:*

```js
await appleScript.volumeUp (15); // Increase the volume by 15
```



#### volumeDown ([amount = 10])

Decreses the current client volume by `amount`. If the `amount` argument is not supplied, the volume will be decreased by 10.

*Example:*

```js
await appleScript.volumeDown (); // Decrease volume by 10
```



#### mute ()

Mutes the volume and saves the currently applied volume for restoring through `unmute()`.

*Example:*
```js
await appleScript.mute ();
```



#### unmute ()

Restores the value that has been set through either `mute()` or `volume(0)`.

*Example:*
```js
await appleScript.unmute ();
```



#### shuffling (mode)

When `mode` is supplied, will enable or disable shuffling. When `mode` is not supplied, the function will return the current shuffle mode.

*Example:*
```js
await appleScript.shuffling (true); // Turn shuffle on
const shuffleActive = await appleScript.shuffling (); // -> true
```



#### repeating (mode)

When `mode` is supplied, will enable or disable repeating. When `mode` is not supplied, the function will return the current repeat mode.

Note: This function is a wrapper for `getRepeating ()` and `setRepeating (mode)`, which can be used instead.

*Example:*
```js
await appleScript.repeating (false); // Turn repeat off
const repeatActive = await appleScript.repeating (); // -> false
```



#### position (time)

When `time` is supplied, will seek to the specified position in the currently running track. When `time` is not supplied, the function will return the current position.

Note: This function is a wrapper for `getPosition ()` and `setPositon (time)`, which can be used instead.

*Example:*
```js
await appleScript.position (70); // Seek to 1m 10s
const currentPosition = await appleScript.position (); // -> 70
```



#### next ()

Skips to the next track.

*Example:*
```js
await appleScript.next ();
```



#### previous ()

Goes back to the last track. If the player is currently in the middle of a song, this will jump to the beginning instead of playing the last song. Call it twice in this case.

*Example:*
```js
await appleScript.previous ();
```



#### focusWindow ()

Activates the Spotify window.

*Example:*
```js
await appleScript.focusWindow ();
```



#### isSpotifyRunning ()

Checks whether the Spotify application is currently running.

*Example:*
```js
const isRunning = await appleScript.isSpotifyRunning (); // -> true/false
```



## Issues

If you find any issues with this library, please head over to [GitHub](https://github.com/NikxDa/node-spotify-helper) and submit an issue there. As this library is actively maintained, I'll do my best to fix errors as quickly as possible.

For any issue, a few informations are necessary:

- What code are you running? What is the issue you have with it?
- In which line does your issue occur? Has it always been like this?
- What are you trying to achieve?
- What version of `node-spotify-helper` are you running?

If these questions are answered in detail, a quick fix should be found for every problem that may occur. Otherwise, if it's a source related error, I'll do my best to fix it as soon as possible.



## Improve these docs

These documents try to point out most of the available functions and what they are doing. Should you find that anything is missing or incorrect, head over to this project's [GitHub](https://github.com/NikxDa/node-spotify) and create a pull request to update this document. If your submitted information is correct and helpful, your request will be merged and you will be listed here. _You can also add yourself to this list._ 

#### Contributors:

- [SplittyDev](https://github.com/SplittyDev/)



## License

MIT
