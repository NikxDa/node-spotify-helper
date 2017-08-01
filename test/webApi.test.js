// Packages
const { expect, assert }    = require ("chai");

// Custom
const SpotifyWebApi     = require ("../src/index").SpotifyWebApi;
const clientId          = "7447ab95f43c402d96dc7da3139a5217";
const clientSecret      = "1569d9854341459b94b30ceaed3e8871";

const webApi = new SpotifyWebApi ();

describe ("Spotify Web Api", function () {
    it ("should be an instance of SpotifyWebApi", function () {
        expect (webApi).to.be.instanceof (SpotifyWebApi);
    });

    it ("should take a market argument and convert it to uppercase", function () {
        const testApi = new SpotifyWebApi ("dE");
        expect (testApi).to.have.property ("market");
        expect (testApi.market).to.be.a ("String");
        assert (testApi.market === "DE");
    });

    describe ("Function authenticate()", function () {
        it ("should authenticate the client", async function () {
            await webApi.authenticate (clientId, clientSecret);
            expect (webApi).to.have.property ("authenticated");
            expect (webApi.authenticated).to.be.a ("Boolean");
        });

        it ("should set the accessToken property", async function () {
            webApi.accessToken = undefined;
            await webApi.authenticate (clientId, clientSecret);
            expect (webApi).to.have.property ("accessToken");
            expect (webApi.accessToken).to.be.a ("String");
        });
    });

    describe ("Function getTracks()", function () {
        it ("should find tracks", async function () {
            const tracks = await webApi.searchTracks ("Calvin Harris");
            expect (tracks).to.have.property ("length");
            expect (tracks).to.be.a ("Array");
        });

        it ("should take limit and offset parameters", async function () {
            const tracks = await webApi.searchTracks ("Calvin Harris", 1);
            assert (tracks.length === 1);

            const offsetTracks = await webApi.searchTracks ("Calvin Harris", 1, 1);
            assert (offsetTracks.length === 1);

            expect (offsetTracks [0]).to.not.equal (tracks [0]);
        });
    })
});
