require('dotenv').config();
const express = require('express');
const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const auth = require('../middleware/auth');
const redisClient = require('../config/redis');

const router = express.Router();


router.post('/shorten', auth, async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ message: 'Original URL is required' });
    }

    const shortId = nanoid(7); // Generate short ID like "abc1234"

    const newUrl = new Url({
        originalUrl,
        shortId,
        createdBy: req.user._id,
    });

    await newUrl.save();

    res.json({
        message: 'Short URL created',
        shortUrl: `${process.env.BASE_URL}/${shortId}`, // e.g. https://yourdomain.com/abc1234
    });
});

router.get("/:shortId", async (req, res) => {

  const { shortId } = req.params;

  const cachedUrl =
    await redisClient.get(`url:${shortId}`);

  if (cachedUrl) {

    console.log("Cache Hit");

    return res.redirect(cachedUrl);
  }

  const url =
    await Url.findOne({ shortId });

  if (!url) {
    return res.status(404).json({
      message: "URL not found"
    });
  }

  await redisClient.set(
    `url:${shortId}`,
    url.originalUrl,
    {
      EX: 86400
    }
  );

  console.log("Cache Miss");

  return res.redirect(url.originalUrl);
});
module.exports = router;
