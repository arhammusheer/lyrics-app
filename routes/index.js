require("dotenv").config();
var express = require("express");
var router = express.Router();
const solenolyrics = require("solenolyrics");
const ytdl = require("ytdl-core");
const youtube = require("youtube-search");

const isYoutube = new RegExp(
	"^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+"
);

const youtubeCreds = {
	maxResults: 1,
	key: process.env.YOUTUBE_API_KEY,
};

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { title: "Lyrics App" });
});

router.post("/", async function (req, res, next) {
	console.log(req.body);
	var song = await getLyrics(req.body.songlink);
	res.render("index", { title: "Lyrics App", song: song });
});

module.exports = router;

async function getLyrics(songLink) {
	var song;
	if (isYoutube.test(songLink)) {
		songInfo = await ytdl.getBasicInfo(songLink);
		song = {
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
		};
	} else {
		songInfo = await youtubeSearch(songLink);
		song = {
			title: songInfo.title,
			url: songInfo.link,
		};
	}
	var lyrics = await solenolyrics.requestLyricsFor(song.title);
	song.lyrics = lyrics;
	return song;
}

async function youtubeSearch(songName) {
	await youtube(songName, youtubeCreds, (err, results) => {
		if (err) {
			console.log(err);
			return err;
		}
		console.log(results);
		return results;
	});
}
