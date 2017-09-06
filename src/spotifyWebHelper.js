// Packages
const request       = require ("request-promise-native");
const ps            = require ("node-ps");

// Native
const { spawn }     = require ("child_process");
const path          = require ("path");
const net           = require ("net");

class SpotifyWebHelper {
    constructor (config) {
        // Default headers for requests
        this.defaultHeaders = {
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "Connection": "close",
            "Origin": "https://open.spotify.com",
            "User-Agent": "NodeSpotifyHelper"
        };

        // Apply config
        Object.assign (this, config);
    }

    getLocalUrl (path, params) {
        const baseUrl = ".spotilocal.com";
        const randomPart = Math.random ().toString (36).substr (2, 9);

        // Build the base url
        let url = `http://${randomPart}${baseUrl}:${this.helperPort}${path}?`;

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

        try {
            // Get the pause URL
            const pauseUrl = this.getLocalUrl ("/remote/pause.json", { pause: pauseState });
            const pauseResponse = await request (this.buildRequestOptions (pauseUrl));

            // Grab the response
            const responseData = JSON.parse (pauseResponse);

            // Check for errors
            if (responseData ["error"])
                throw new Error ("SpotifyWebHelper returned an error.");

            // Parse the data and return
            return this.status (responseData);
        } catch (err) {
            throw new Error ("Pause request failed.");
        }
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

        // Try requesting the resource
        try {
            // Build play URL
            const playUrl = this.getLocalUrl ("/remote/play.json", { uri: uri, context: context });
            const playResponse = await request (this.buildRequestOptions (playUrl));

            // Parse response into JSON and return
            const responseData = JSON.parse (playResponse);

            // Check for errors
            if (responseData ["error"])
                throw new Error ("SpotifyWebHelper returned an error.");

            // Parse the data and return
            return this.status (responseData);
        } catch (err) {
            throw new Error ("Play request failed.");
        }
    }

    async rawStatus () {
        // Make sure that connect() has been called
        if (!this.connectionEstablished)
            throw new Error ("Not connected to the WebHelper.");

        try {
            // Build status URL
            const statusUrl = this.getLocalUrl ("/remote/status.json");
            const statusResponse = await request (this.buildRequestOptions (statusUrl));

            // Parse status into JSON and return
            const status = JSON.parse (statusResponse);
            return status;
        } catch (err) {
            console.log (err);
            throw new Error ("Status request failed.");
        }
    }

    async status (raw) {
        // The raw argument is used for parsing without reloading
        // This allows us to refurbish the output of play, pause, etc
        const status = raw || await this.rawStatus ();

        // Return refurbished status
        return {
            playing: status.playing || false,
            volume: status.volume || 0,
            time: status.playing_position || 0,
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
            const oAuthUrl = "https://open.spotify.com/token";
            const oAuthResponse = await request (this.buildRequestOptions (oAuthUrl));
            const oAuthData = JSON.parse (oAuthResponse);

            // Extract oAuth Token
            const oAuthToken = oAuthData ["t"];

            // Then grab CSRF token
            const csrfUrl = this.getLocalUrl ("/simplecsrf/token.json");
            const csrfResponse = await request (this.buildRequestOptions (csrfUrl));
            const csrfData = JSON.parse (csrfResponse);

            // Extract CSRF Token
            const csrfToken = csrfData ["token"];

            // Return everything
            return {
                oAuth: oAuthToken,
                csrf: csrfToken
            };
        } catch (err) {
            // Something went wrong
            throw new Error ("Error during authentication.");
        }
    }

    find_first_local_port_in_use (start, end) {
        function is_local_port_in_use (port) {
            function promiseWrapper (resolve, reject) {
                const server = net.createServer ();
                const cleanup = () => {
                    server.removeAllListeners ('error');
                    server.removeAllListeners ('listening');
                    server.close ();
                    server.unref ();
                };
                server.once ('error', err => {
                    cleanup ();
                    resolve (err.code === 'EADDRINUSE');
                });
                server.once ('listening', () => {
                    cleanup ();
                    resolve (false);
                });
                server.listen (port, '127.0.0.1');
            }
            return new Promise (promiseWrapper);
        }
        async function promiseWrapper (resolve, reject) {
            const ports = new Array (end - start).fill ().map ((_, i) => i + start);
            for (let port of ports) {
                const result = await is_local_port_in_use (port);
                if (result) return resolve (port);
            }
            reject ();
        }
        return new Promise (promiseWrapper);
    }

    async getWebHelperPort () {
        try {
            // Scan the default ports
            // Range: 4370 - 4390
            return await this.find_first_local_port_in_use (4370, 4390);
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
            // HACK: Prevent 'windows not supported' error
            if (/^win/.test (process.platform)) {
                resolve (true);
                return;
            }
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
            throw new Error ("WebHelper not found!");
    }

    buildRequestOptions (uri) {
        // Apply headers by default
        return {
            uri: uri,
            headers: this.defaultHeaders
        };
    }
}

// Export the class
module.exports = SpotifyWebHelper;