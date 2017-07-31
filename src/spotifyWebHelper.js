// Packages
const fetch         = require ("node-fetch");
const portscanner   = require ("portscanner");
const ps            = require ("node-ps");

// Native
const { spawn }     = require ("child_process");
const path          = require ("path");

class SpotifyWebHelper {
    constructor (config) {
        // Origin Header for Requests
        this.originHeader = { "origin": "https://open.spotify.com" };

        // Apply config
        Object.assign (this, config);
    }

    getLocalUrl (path, params) {
        const baseUrl = ".spotilocal.com";
        const randomPart = Math.random ().toString (36).substr (2, 9);

        // Build the base url
        let url = `https://${randomPart}${baseUrl}:${this.helperPort}${path}?`;

        // Set CSRF and OAuth if the tokens are set on the instance
        if (this.csrfToken && this.oAuthToken)
            url += `&csrf=${this.csrfToken}&oauth=${this.oAuthToken}`;

        // Add additional arguments
        if (params)
            for (let param in params)
                url += `&${param}=${params[param]}`;

        // Return the built URL
        return url;
    }

    fixTimeFormat (time) {
        // Calculate minutes and seconds
        let minutes = Math.floor (time / 60).toString ();
        let seconds = Math.floor (time % 60).toString ();

        // Pad seconds so that they are in format 01, 02, ...
        if (seconds.length === 1) seconds = `0${seconds}`;

        // Return formatted time
        return `${minutes}:${seconds}`;
    }

    async seek (seconds) {
        /*
            WARNING:
            In my tests, this did not seem to work at all.
            Even other libraries including this functionality did not seem to work.
            I am including this anyway because it seems like there are some functional clients out there, based on my research.
        */

        // Output the above warning
        if (this.warnings)
            console.log ("The seek() function seems to be rarely supported. Use it wisely.");

        // Get currently playing URI
        const status = await this.status ();
        const currentUri = status.current.track.uri;

        // Convert the time format
        const spotifyTime = this.fixTimeFormat (seconds);

        // Play it
        await this.play (`${currentUri}#${spotifyTime}`);
    }

    async unpause () {
        // Just pause with "pause=false"
        const response = await this.pause (false);

        // Return
        return response;
    }

    async pause (state) {
        // Make sure that connect() has been called
        if (!this.connectionEstablished)
            throw new Error ("Not connected to the WebHelper.");

        // Determine the pause state
        let pauseState = (state !== false) ? true : false;

        // Get the pause URL
        const pauseUrl = this.getLocalUrl ("/remote/pause.json", { pause: pauseState });
        const pauseResponse = await fetch (pauseUrl, this.originHeader);

        // Grab the response
        const response = await pauseResponse.json ();

        // Check for errors
        if (response ["error"])
            throw new Error ("SpotifyWebHelper returned an error.");

        // Parse returned status and return
        return this.status (response);
    }

    async play (uri, context) {
        // Make sure that connect() has been called
        if (!this.connectionEstablished)
            throw new Error ("Not connected to the WebHelper.");

        if (!uri) {
            // Probably, the user meant to call unpause()
            // Do this instead
            return this.unpause ();
        }

        // Use a small check to verify the URI
        if (uri.toLowerCase ().indexOf ("spotify:track") === -1)
            throw new Error ("Invalid Track URI.");

        // Context placeholder
        context = context || "";

        // Build play URL
        const playUrl = this.getLocalUrl ("/remote/play.json", { uri: uri, context: context });
        const playResponse = await fetch (playUrl, this.originHeader);

        // Parse response into JSON and return
        const response = playResponse.json ();
        return this.status (response);
    }

    async rawStatus () {
        // Make sure that connect() has been called
        if (!this.connectionEstablished)
            throw new Error ("Not connected to the WebHelper.");

        // Build status URL
        const statusUrl = this.getLocalUrl ("/remote/status.json");
        const statusResponse = await fetch (statusUrl, this.originHeader);

        // Parse status into JSON and return
        const status = await statusResponse.json ();
        return status;
    }

    async status (raw) {
        // The raw argument is used for parsing without reloading
        // This allows us to refurbish the output of play, pause, etc
        const status = raw || await this.rawStatus ();

        // Return refurbished status
        return {
            playing: status.playing || undefined,
            volume: status.volume || undefined,
            time: status.playing_position || undefined,
            current: (status.track) ? {
                track: {
                    name: status.track.track_resource.name,
                    uri: status.track.track_resource.uri,
                    link: status.track.track_resource.location.og
                },
                artist: {
                    name: status.track.artist_resource.name,
                    uri: status.track.artist_resource.uri,
                    link: status.track.artist_resource.location.og
                },
                album: {
                    name: status.track.album_resource.name,
                    uri: status.track.album_resource.uri,
                    link: status.track.album_resource.location.og
                }
            } : undefined
        };
    }

    async information () {
        // Grab raw status
        const status = await this.rawStatus ();

        // Return information data
        return {
            version: status.version,
            clientVersion: status.client_version
        };
    }

    async isEnabled () {
        // Grab raw status
        const status = await this.rawStatus ();

        // Return refurbished data
        return {
            previousTrack: status.prev_enabled,
            playPause: status.play_enabled,
            nextTrack: status.next_enabled
        };
    }

    async isPlaying () {
        // Self-explaining
        const status = await this.rawStatus ();
        return status.playing;
    }

    async isShuffle () {
        // Self-explaining
        const status = await this.rawStatus ();
        return status.shuffle;
    }

    async isRepeat () {
        // Self-explaining
        const status = await this.rawStatus ();
        return status.repeat;
    }

    async volume () {
        // Self-explaining
        const status = await this.rawStatus ();
        return status.volume;
    }

    async connect (tryStart) {
        // tryStart defaults to true
        tryStart = (tryStart === undefined) ? true : tryStart;

        // First of all, check if the WebHelper is running
        const isRunning = await this.webHelperRunning ();

        // The WebHelper is not running
        if (!isRunning) {
            // Should we try and start it manually?
            if (tryStart) {
                await this.startWebHelper ();
                return this.connect ();
            } else {
                // Throw an error
                throw new Error ("SpotifyWebHelper not running.");
            }
        }

        // Grab tokens
        const tokens = await this.getTokens ();

        // Add them to our instance
        this.oAuthToken = tokens.oAuth;
        this.csrfToken = tokens.csrf;

        // Finally, save the localhost URL
        this.connectionUrl = `https://127.0.0.1:${this.helperPort}`;

        // Mark the connection as established
        this.connectionEstablished = true;

        // And return it
        return this.connectionUrl;
    }

    async getTokens () {
        try {
            // Scan ports to find webHelper
            const helperPort = await this.getWebHelperPort ();
            if (helperPort === -1)
                throw new Error ("SpotifyWebHelper not open.");

            // Scan successful, set the port
            this.helperPort = helperPort;

            // First grab OAuth token
            const oAuthResponse = await fetch ("https://open.spotify.com/token");
            if (oAuthResponse.status !== 200)
                throw new Error ("Invalid response from CSRF Server");

            // Extract oAuth Token
            const oAuthToken = (await oAuthResponse.json ()) ["t"];

            // Then grab CSRF token
            const csrfUrl = this.getLocalUrl ("/simplecsrf/token.json");
            const csrfResponse = await fetch (csrfUrl, { headers: this.originHeader });
            if (csrfResponse.status !== 200)
                throw new Error ("Invalid response from CSRF Server");

            // Extract CSRF Token
            const csrfToken = (await csrfResponse.json ()) ["token"];

            // Return everything
            return {
                oAuth: oAuthToken,
                csrf: csrfToken
            };
        } catch (err) {
            // Something went wrong
            throw new Error ("Error during authentication: " + err.message);
        }
    }

    async getWebHelperPort () {
        try {
            // Scan the default ports
            // Range: 4370 - 4390
            const port = await portscanner.findAPortInUse (4370, 4390, "127.0.0.1");
            return port;
        } catch (err) {
            // No used port found. Damn. Return -1
            return -1;
        }
    }

    webHelperRunning () {
        // Get Web Helper Path
        const webHelperLocation = this.getWebHelperLocation ();

        // Promise Wrapper
        function promiseWrapper (resolve, reject) {
            // Search for the Process by Path
            ps.lookup ({ command: webHelperLocation }, (err, results) => {
                // Error? Reject
                if (err) reject (err);

                // Check whether there are running processes that match and resolve
                resolve (results.length > 0);
            });
        }

        // Return the Promise
        return new Promise (promiseWrapper);
    }

    startWebHelper () {
        // Get Web Helper Path
        const webHelperLocation = this.getWebHelperLocation ();

        // Result valid? Start WebHelper
        if (webHelperLocation) spawn (webHelperLocation);
    }

    getWebHelperLocation () {
        // Windows
        if (process.platform === "win32")
            // %APPDATA%\Spotify\SpotifyWebHelper.exe
            return path.join (process.env.APPDATA, "Spotify", "SpotifyWebHelper.exe");
        // OSX
        else if (process.platform === "darwin")
            // /Users/#/Library/Application Support/Spotify/SpotifyWebHelper
            return path.join (process.env.HOME, "Library", "Application Support", "Spotify", "SpotifyWebHelper");
        // Other
        else
            // Cannot currently support because I have no idea what paths are used
            return false;
    }
}

// Export the class
module.exports = SpotifyWebHelper;
