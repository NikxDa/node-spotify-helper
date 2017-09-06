// WebHelperApi

const WebHelperApi = require ("../src/").SpotifyWebHelper;
const api = new WebHelperApi ();

// Using an async function
// You an also use Promises (.then(), .catch(), ...)
async function apiDemo () {
    try {
        // Grab the volume
        const volume = await api.volume ();
        console.log ("Current volume: " + volume);

        // Skip to next track
        await api.next ();
        console.log ("Skipped to next track.");

        // View current track
        const track = await api.currentTrack ();
        console.log (`Playing: ${track.artist} - ${track.name}`);

        // Jump to the middle
        const midTime = track.duration / 2;
        await api.position (midTime);
        console.log ("Jumped to the middle of the track");

        // Where are we at now?
        const position = await api.position ();
        console.log ("We're now at " + position + " seconds");

        // Lets play some Calvin Harris
        await api.play ("spotify:track:5bcTCxgc7xVfSaMV3RuVke");
        console.log ("Played Calvin Harris");

        // Pause da tunes
        await api.pause ();
        console.log ("Pausing the playback...");

        // Continue playing
        await api.play ();
        console.log ("Aand resuming. The music is important!");

        // Mute
        await api.mute ();
        console.log ("Muted the client");

        // And unmute
        await api.unmute ();
        console.log ("But we want to hear the music!");

        // Now open the window, we might want to do a search
        await api.focusWindow ();
        console.log ("Gotta open this window right here");

        // Or, enable shuffling
        await api.setShuffling (true);
        // or setRepeat (true)

        // Are we repeating?
        const repeatState = await api.repeating ();
        console.log ("We are " + ((repeatState) ? "" : "not ") + "repeating!");
    } catch (err) {
        console.log (err.stack);
    }
}

apiDemo ();