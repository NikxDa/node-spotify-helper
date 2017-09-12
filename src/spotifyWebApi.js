// Packages
const request   = require ("request-promise-native");
const base64    = require ("base-64");
const fs        = require ("fs-extra");
const path      = require ("path");

class SpotifyWebApi {
    constructor (market) {
        this.market = (market) ? market.toUpperCase () : undefined;
        this.authenticated = false;
        this.tokenFile = path.join (__dirname, ".spotify-token");
        this.urls = {
            auth: "https://accounts.spotify.com/api/token",
            search: "https://api.spotify.com/v1/search"
        };
    }

    async search (text, type, limit, offset, retry) {
        if (!this.authenticated)
            throw new Error ("Not authenticated. Call authenticate() first.");

        const authData = `Bearer ${this.accessToken}`;

        const headers = {
            "Authorization": authData,
            "Accept": "application/json"
        };

        const query = `?query=${text}&type=${type}${(limit) ? "&limit=" + limit : ""}${(offset) ? "&offset=" + offset : ""}${(this.market) ? "&market=" + this.market : ""}`;
        const url = this.urls.search + query;

        const response = await request ({ uri: url, headers: headers });
        const responseData = JSON.parse (response);

        if (responseData.error) {
            if (responseData.error.status === 401) {
                // Authorization invalid
                retry = false;
                if (retry !== false) {
                    await authenticate (this.clientId, this.clientSecret);
                    const newResponseData = await search (text, type, limit, offset, false);
                    return newResponseData;
                } else {
                    throw new Error (`Authentication failed repeatedly.`);
                }
            } else {
                throw new Error (`ApiError: ${responseData.error.message}`);
            }
        }

        return responseData;
    }

    async authenticate (clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        /*
        const tokenExists = await fs.exists (this.tokenFile);
        if (tokenExists) {
            this.accessToken = await fs.readFile (this.tokenFile);
            this.authenticated = true;
            logr.log ("Loaded access token from file");
            return true;
        }
        */
        const authText = `${clientId}:${clientSecret}`;
        const authData = `Basic ${base64.encode (authText)}`;

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": authData,
            "Accept": "application/json"
        };

        const body = "grant_type=client_credentials";
        const requestOptions = {
            uri: this.urls.auth,
            method: "POST",
            body: body,
            headers: headers
        };

        const response = await request (requestOptions);
        const responseData = JSON.parse (response);

        if (responseData.error)
            throw new Error (`ApiError: ${responseData.error}`);

        this.accessToken = responseData.access_token;
        this.authenticated = true;

        //await fs.writeFile (this.tokenFile, this.accessToken.toString ());

        return true;
    }

    async searchTracks (name, limit, offset) {
        const response = await this.search (name, "track", limit, offset);
        const tracks = response.tracks.items;
        const filteredResponse = [];

        tracks.forEach ((track) => {
            const filteredTrack = {
                album: {
                    name: track.album.name,
                    uri: track.album.uri
                },
                artists: track.artists.map (x => x.name),
                duration: track.duration,
                uri: track.uri,
                popularity: track.popularity,
                name: track.name
            };

            filteredResponse.push (filteredTrack);
        });

        return filteredResponse;
    }

    async searchPlaylists (name, limit, offset) {
        const response = await this.search (name, "playlist", limit, offset);
        const playlists = response.playlists.items;
        const filteredPlaylists = [];

        playlists.forEach ((playlist) => {
            const filteredPlaylist = {
                name: playlist.name,
                trackCount: playlist.tracks.total,
                uri: playlist.uri
            };

            filteredPlaylists.push (filteredPlaylist);
        });

        return filteredPlaylists;
    }

    async searchArtists (name, limit, offset) {
        const response = await this.search (name, "artist", limit, offset);
        const artists = response.artists.items;
        const filteredArtists = [];

        artists.forEach ((artist) => {
            const filteredArtist = {
                name: artist.name,
                popularity: artist.popularity,
                genres: artist.genres,
                followers: artist.followers.total,
                uri: artist.uri
            };

            filteredArtists.push (filteredArtist);
        });

        return filteredArtists;
    }
}

module.exports = SpotifyWebApi;
