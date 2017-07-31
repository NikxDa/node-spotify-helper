// Packages
const { expect, assert }    = require ("chai");

// Custom
const SpotifyWebHelper  = require ("../src/index").SpotifyWebHelper;

const webHelper = new SpotifyWebHelper ();

describe ("Spotify Web Helper API", function () {
    it ("should be an instance of SpotifyWebHelper", function () {
        expect (webHelper).to.be.instanceof (SpotifyWebHelper);
    });

    it ("should have a property originHeader", function () {
        expect (webHelper).to.have.property ("originHeader");
    });

    describe ("Function connect ()", function () {
        it ("should return a connection URL", async function () {
            const url = await webHelper.connect ();
            expect (url).to.be.a ("String");
        });
    });

    describe ("Function status ()", function () {
        it ("should return a status object", async function () {
            const status = await webHelper.status ();
            expect (status.current).to.be.a ("Object");
            expect (status).to.have.property ("playing");
            expect (status).to.have.property ("current");
        });

        it ("should handle invalid parameters", async function () {
            const status = await webHelper.status ({ test: "Test" });
            expect (status).to.be.a ("Object");
            expect (status).to.have.property ("playing");
            expect (status).to.have.property ("current");
        })
    });

    describe ("Function information ()", function () {
        it ("should return version information", async function () {
            const data = await webHelper.information ();
            expect (data).to.be.a ("Object");
            expect (data).to.have.property ("version");
        })
    });

    describe ("Function getLocalUrl ()", function () {
        it ("should return unique URLs", function () {
            const url1 = webHelper.getLocalUrl ();
            const url2 = webHelper.getLocalUrl ();
            expect (url1).to.not.equal (url2);
        });

        it ("should include oAuth and CSRF tokens", function () {
            const url = webHelper.getLocalUrl ();
            assert (url.indexOf ("oauth") >= 0);
            assert (url.indexOf ("csrf") >= 0);
        });

        it ("should include a custom path", function () {
            const url = webHelper.getLocalUrl ("/test/test");
            assert (url.indexOf ("/test/test") >= 0);
        });

        it ("should include custom parameters", function () {
            const url = webHelper.getLocalUrl ("", { testParam: "hello" });
            assert (url.indexOf ("&testParam=hello") >= 0);
        });
    });

    describe ("Function pause ()", function () {
        it ("should pause the playback", async function () {
            const playStatus = await webHelper.unpause ();
            const nowStatus = await webHelper.pause ();

            expect (nowStatus.playing).to.not.equal (playStatus.playing);
            await webHelper.unpause ();
        });
    });

    describe ("Function unpause ()", function () {
        it ("should unpause the playback", async function () {
            const playStatus = await webHelper.pause ();
            const nowStatus = await webHelper.unpause ();

            expect (nowStatus.playing).to.not.equal (playStatus.playing);
        });
    });

    describe ("Function play ()", function () {
        it ("should play a given URI", async function () {
            const testUri = "spotify:track:5bcTCxgc7xVfSaMV3RuVke";
            const alternativeTestUri = "spotify:track:4uLU6hMCjMI75M1A2tKUQC";

            const currentUri = (await webHelper.status ()).current.track.uri;
            if (currentUri !== testUri)
                await webHelper.play (testUri); // Calvin Harris - Feels
            else {
                await webHelper.play (alternativeTestUri); // See for yourself
            }

            const newUri = (await webHelper.status ()).current.track.uri;
            expect (newUri).to.equal ((currentUri !== testUri) ? testUri : alternativeTestUri);
            expect (newUri).to.not.equal (currentUri);
        });

        it ("should unpause the playback when not supplied with a URI", async function () {
            const playStatus = await webHelper.pause ();
            const nowStatus = await webHelper.play ();

            expect (nowStatus.playing).to.not.equal (playStatus.playing);
        });
    });

    describe ("Function rawStatus ()", function () {
        it ("should return the raw Spotify status format", async function () {
            const raw = await webHelper.rawStatus ();
            expect (raw).to.have.property ("volume");
            expect (raw).to.have.property ("playing_position");
        });
    });

    describe ("Function isPlaying ()", function () {
        it ("should return a boolean", async function () {
            const playing = await webHelper.isPlaying ();
            expect (playing).to.be.a ("Boolean");
        });
    });

    describe ("Function isShuffle ()", function () {
        it ("should return a boolean", async function () {
            const shuffle = await webHelper.isShuffle ();
            expect (shuffle).to.be.a ("Boolean");
        });
    });

    describe ("Function isRepeat ()", function () {
        it ("should return a boolean", async function () {
            const repeat = await webHelper.isRepeat ();
            expect (repeat).to.be.a ("Boolean");
        });
    });

    describe ("Function isEnabled ()", function () {
        it ("should return an object", async function () {
            const enabled = await webHelper.isEnabled ();
            expect (enabled).to.be.a ("Object");
        });

        it ("should return an object with previousTrack, nextTrack, playPause", async function () {
            const enabled = await webHelper.isEnabled ();
            expect (enabled).to.have.property ("previousTrack");
            expect (enabled).to.have.property ("nextTrack");
            expect (enabled).to.have.property ("playPause");
        });
    });
});
