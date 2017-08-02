// Native
const { spawn }     = require ("child_process");

class SpotifyAppleScriptApi {
    constructor () {
        // Since AppleScript is only available on macOS, we need this check basically everywhere
        this.ensureDarwinOnly ();

        // Set the script name
        this.scriptName = "osascript";

        // Set the default mute value
        this.muteValue = undefined;
    }

    async volume (value) {
        // Dont check darwin here, functions will do

        // Check if the value parameter is set
        if (value !== undefined && typeof value === "number") {
            // User wants to set a new value
            return await this.setVolume (value);
        } else {
            // User wants to retrieve the value
            return await this.getVolume ();
        }
    }

    async getVolume () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to receive the volume
        const script = `tell application "Spotify" to get sound volume`;

        // Get the output
        const output = await this.runAppleScript (script);

        // Store volume
        let volume = parseInt (output);

        /*
            Spotify has a bug where, whenever you set a volume, the value received by getVolume will
            be 1 less. This applies to all numbers, except for numbers where n % 20 == 0. Therefore:
                setVolume (100); getVolume (); -> 100
                setVolume (60); getVolume (); -> 60
                setVolume (0); getVolume (); -> 0
            But also:
                setVolume (99); getVolume (); -> 98
                setVolume (81); getVolume (); -> 80
                setVolume (1); getVolume (); -> 0
            We will try and cover this.
        */

        // Increase the value if the volume is none of 0, 20, 40, 60, 80 or 100
        if (volume % 20 !== 0)
            return volume + 1;
        else
            return volume;

        // This will still not fix it completely.
        // setValue (81); getValue () -> 80
        // But:
        // setValue (66); getValue () -> 66
    }

    async setVolume (value) {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Check the value range
        if (value < 0 || value > 100)
            throw new Error ("Value out of range.");

        // Normalize the value
        value = Math.round (value);

        // Will the sound be muted?
        if (value === 0)
            this.muteVolume = await this.getVolume ();
        else
            this.muteVolume = undefined;

        // Define the script to change the volume
        const script = `tell application "Spotify" to set sound volume to ${value}`;

        // Run the script
        await this.runAppleScript (script);
    }

    async getShuffling () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to get the shuffling mode
        const script = `tell application "Spotify" to get shuffling`;

        // Get the output
        const output = await this.runAppleScript (script);

        // Parse it
        return (output === "true\n");
    }

    async setShuffling (value) {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Verify the value
        if (typeof value !== "boolean")
            throw new Error ("Value parameter must be either true or false.");

        // Define the script to change the shuffling mode
        const script = `tell application "Spotify" to set shuffling to ${value}`;

        // Run the script
        await this.runAppleScript (script);
    }

    async shuffling (value) {
        // Dont check darwin here, functions will do

        // Check whether value is true or false
        if (value === false || value === true) {
            // Set the shuffling mode
            return await this.setShuffling (value);
        } else {
            // Get and return the active shuffling mode
            return await this.getShuffling ();
        }
    }

    async getRepeating () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to get the repeating mode
        const script = `tell application "Spotify" to get repeating`;

        // Get the output
        const output = await this.runAppleScript (script);

        // Parse it
        return (output === "true\n");
    }

    async setRepeating (value) {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Verify the value
        if (typeof value !== "boolean")
            throw new Error ("Value parameter must be either true or false.");

        // Define the script to change the repeating mode
        const script = `tell application "Spotify" to set repeating to ${value}`;

        // Run the script
        await this.runAppleScript (script);
    }

    async repeating (value) {
        // Dont check darwin here, functions will do

        // Check whether value is true or false
        if (value === false || value === true) {
            // Set the shuffling mode
            return await this.setRepeating (value);
        } else {
            // Get and return the active shuffling mode
            return await this.getRepeating ();
        }
    }

    async currentTrack () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Create empty data object
        const data = {};

        // Which properties does Spotify expose?
        // Notice: artwork, played_count and starred have been excluded, because they failed
        const properties = ["name", "duration", "album", "artist",
            "disc number", "track number", "popularity", "id",
            "artwork url", "album artist", "spotify url"];

        // Iterate over those properties and fetch them
        for (let prop of properties) {
            // Request a single property
            let script = `tell application "Spotify" to get ${prop} of current track`;
            let result = await this.runAppleScript (script);

            // Replace " " with "_" to allow JS mapping
            let normalizedName = prop.replace (" ", "_");

            // Add the property, but remove the "\n" at the end
            let normalizedValue = result.substr (0, result.length - 1);

            // Is it a string?
            if (normalizedValue [0] === '"' && normalizedValue [normalizedValue.length - 1] === '"') {
                // Remove first and last char, as they are quotes
                normalizedValue = normalizedValue.substr (1, normalizedValue.length - 2);
            } else if (/[0-9]+/.test (normalizedValue)) {
                // It's a number
                normalizedValue = parseInt (normalizedValue);
            }

            // Populate the data object
            data [normalizedName] = normalizedValue;
        }

        // Fix duration (From MS to Seconds)
        data.duration = Math.round (parseInt (data.duration) / 1000)

        // Return data
        return data;
    }

    async play (uri, context) {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Define script
        let script;

        // Is the URI set? Otherwise just play
        if (uri) {
            // Update the context to integrate into the command
            context = (context) ? `in context "${context}"` : "";

            // Play a track uri, optionally with context
            script = `tell application "Spotify" to play track "${uri}"${context}`;
        } else {
            // User probably wanted to unpause
            await this.unpause ();
        }

        // Run the script
        await this.runAppleScript (script);
    }

    async pause () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to pause
        const script = `tell application "Spotify" to pause`;

        // Run the script
        await this.runAppleScript (script);
    }

    async unpause () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to pause
        const script = `tell application "Spotify" to play`;

        // Run the script
        await this.runAppleScript (script);
    }

    async playPause () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to toggle play/pause
        const script = `tell application "Spotify" to playpause`;

        // Run the script
        await this.runAppleScript (script);
    }

    async setPosition (time) {
        // Fix time
        time = parseInt (time) || 0;

        // Script to set player position
        const script = `tell application "Spotify" to set player position to ${time}`;

        // Run the script
        await this.runAppleScript (script);
    }

    async getPosition () {
        // Script to get player position
        const script = `tell application "Spotify" to get player position`;

        // Run the script
        const time = await this.runAppleScript (script);

        // Parse and return
        return Math.round (parseInt (time));
    }

    async position (time) {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Param set and a number?
        if (time === undefined) {
            // Set position to time
            return await this.getPosition ();
        } else if (typeof time === "number") {
            // Parse time
            time = parseInt (time);

            // Get the position
            return await this.setPosition (time);
        } else {
            throw new Error ("Invalid time format.");
        }
    }

    async next () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to play next track
        const script = `tell application "Spotify" to next track`;

        // Run the script
        await this.runAppleScript (script);
    }

    async previous () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to play previous track
        const script = `tell application "Spotify" to previous track`;

        // Run the script
        await this.runAppleScript (script);
    }

    async volumeUp (amount) {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Parse amount
        amount = parseInt (amount) || 10;

        // Current sound volume
        // We use this instead of "sound volume" because of the bug described in getVolume()
        // If we used "sound volume" directly, we'd get invalid data
        const currentVolume = await this.getVolume ();

        // Script to increase
        const script = `
            tell application "Spotify"
                if (${currentVolume + amount} > 100)
                    set sound volume to 100
                else if (${currentVolume + amount} < 0)
                    set sound volume to 0
                else
                    set sound volume to (${currentVolume + amount})
                end if
            end tell
        `;

        // Run the script
        this.runAppleScript (script);
    }

    async volumeDown (amount) {
        // Dont check darwin here, functions will do

        // Pase amount into negative
        amount = -parseInt (amount) || -10;

        // Now just call volumeUp
        return await this.volumeUp (amount);
    }

    async mute () {
        // Dont check darwin here, functions will do

        // Mute
        // The volume function will automaticall detect and set the muteVolume
        return await this.volume (0);
    }

    async unmute () {
        // Dont check darwin here, functions will do

        // Has a mute volume been set?
        if (!this.muteVolume) return;

        // Reset volume
        await this.volume (this.muteVolume);

        // Clear mute volume
        this.muteVolume = undefined;
    }

    async focusWindow () {
        // Make sure we are running macOS
        await this.ensureApiReady ();

        // Script to focus the Spotify Application
        const script = `tell application "Spotify" to activate`;

        // Run script
        await this.runAppleScript (script);
    }

    async ensureApiReady () {
        // Make sure we're on macOS
        this.ensureDarwinOnly ();

        // Make sure Spotify is running
        const spotifyRunning = await this.isSpotifyRunning ();

        if (!spotifyRunning)
            throw new Error ("Spotify is not currently running.");
    }

    async isSpotifyRunning () {
        // Make sure we are running macOS
        this.ensureDarwinOnly ();

        // Script to find out if Spotify is running
        const script = `
            if application "Spotify" is running then
                return true
            else
                return false
            end if
        `;

        // Run the script
        const result = await this.runAppleScript (script);

        // Process the output
        return (result === "true\n");
    }

    runAppleScript (script) {
        // Make sure we are running macOS
        this.ensureDarwinOnly ();

        // Spawn the process
        const process = spawn (this.scriptName, ["-ss"]);

        // Wrap the in- and output streams so that we can access their content
        wrapStreams (process.stdout, process.stdin, process.stderr);

        // Wrapper for the Promise
        function promiseWrapper (resolve, reject) {
            // Wait for the process to exit
            process.on ("exit", (code) => {
                // Did the process crash?
                if (code !== 0) reject (process.stderr.textContent);

                // Resolve
                resolve (process.stdout.textContent);
            });

            // Pipe the script into stdin and end
            console.log (script);
            process.stdin.write (script);
            process.stdin.end ();
        };

        // Return the Promise
        return new Promise (promiseWrapper);
    }

    ensureDarwinOnly () {
        // Detect our current platform
        const platform = process.platform;

        // Are we on macOS/OSX?
        if (platform !== "darwin") {
            // We're not, but AppleScript is only available there. Throw an error.
            throw new Error ("The Spotify AppleScript API is only available on macOS/OSX.");
        }
    }
}

// Helper functions
function wrapStreams () {
    // Iterate over the param-array (which should consist of Streams)
    for (let stream of arguments) {
        // Set a textContent property
        stream.textContent = "";

        // Set the stream encoding
        stream.setEncoding ("utf-8");

        // When the stream receives data, add it to the textContent
        stream.on ("data", (data) => { stream.textContent += data; });
    }
}

// Export the API
module.exports = SpotifyAppleScriptApi;
