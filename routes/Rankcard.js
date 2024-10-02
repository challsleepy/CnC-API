const router = require('express').Router();
const fs = require('fs');
const GIFEncoder = require('gifencoder');
const canvas = require('canvas');
const editorSession = require('../schemas/rankEditorSessionSchema');
const xpUser = require('../schemas/xpUser');

const xpLevels = [100, 155, 220, 295, 380, 475, 580, 695, 820, 955, 1100, 1260, 1420, 1600, 1780, 1980, 2180, 2400, 2620, 2860, 3100, 3360, 3620, 3900, 4180, 4480, 4780, 5100, 5420, 5760, 6100, 6460, 6820, 7200, 7580, 7980, 8380, 8800, 9220, 9660, 10100, 10560, 11020, 11500, 11980, 12480, 12980, 13500, 14020, 14560, 15100, 15660, 16220, 16800, 17380, 17980, 18580, 19200, 19820, 20460, 21100, 21760, 22420, 23100, 23780, 24480, 25180, 25900, 26620, 27360, 28100, 28860, 29620, 30400, 31180, 31980, 32780, 33600, 34420, 35260, 36100, 36960, 37820, 38700, 39580, 40480, 41380, 42300, 43220, 44160, 45100, 46060, 47020, 48000, 48980, 49980, 50980, 52000, 53020, 54060];

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

const generateRankCard = async (avatarURL, xp, level, progressBarColor, background, rank, candyImage) => {
    const xpToNextLevel = xpLevels[level];
    const avatar = await canvas.loadImage(avatarURL);
    const width = 200;
    const height = 200;

    // Create canvas
    const cv = canvas.createCanvas(width, height);
    const ctx = cv.getContext('2d');
    ctx.scale(2, 2)

    // Draw background image
    // Check is background is hexcode, url or image path
    if (background.startsWith('#')) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, 100, 100);
    }

    if (background.startsWith('http')) {
        const bg = await canvas.loadImage(background);
        ctx.drawImage(bg, 0, 0, 100, 100);
    }

    if (background.startsWith('/')) {
        const bg = await canvas.loadImage(background);
        ctx.drawImage(bg, 0, 0, 100, 100);
    }

    // Add gray overlay if background is an image
    if (!background.startsWith('#')) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 100, 100);
    }

    // Progress bar track
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.arc(50, 50, 30, Math.PI * 0.8, Math.PI * 2.2, false);
    if (!background.startsWith('#')) {
        ctx.strokeStyle = 'rgba(51, 51, 51, 0.75)';
    } else {
        ctx.strokeStyle = 'rgba(51, 51, 51)';
    }
    ctx.stroke();
    ctx.closePath();

    // Progress bar
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.arc(50, 50, 30, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * (xp / xpToNextLevel)), false);
    ctx.strokeStyle = progressBarColor;
    ctx.stroke();
    ctx.closePath();

    // Make circular arc of radius 15px at 10, 10. Then draw the avatar image in the circle
    ctx.beginPath();
    ctx.arc(18, 18, 14, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#222222';
    ctx.fill()

    // Draw avatar image
    ctx.save();
    ctx.beginPath();
    ctx.arc(18, 18, 12, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 6, 6, 24, 24);
    ctx.restore();

    // Level text
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#eeeeee';
    ctx.textAlign = 'center';
    ctx.fillText(`${level}`, 50, 47);

    // XP text
    ctx.font = '6px sans-serif';
    ctx.fillStyle = '#eeeeee';
    ctx.textAlign = 'center';
    let xpText = `${xp} / ${xpToNextLevel}`;
    if (xpToNextLevel >= 1000) {
        xpText = `${xp} / ${(xpToNextLevel / 1000).toFixed(1)}k`;
    }
    if (xp >= 1000) {
        xpText = `${(xp / 1000).toFixed(1)}k / ${(xpToNextLevel / 1000).toFixed(1)}k`;
    }
    ctx.fillText(xpText, 50, 57);

    // Draw rectangle storing candy image and rank #282828
    ctx.font = 'bold 7px georgia';
    const rankPos = `#${rank}`;
    const textMetrics = ctx.measureText(rankPos);
    const textWidth = textMetrics.width;

    const padding = 4; // Space between text, image, and border

    const imageWidth = 12;
    const imageHeight = 12;
    const rectWidth = textWidth + imageWidth + padding * 3; // Account for image width and padding
    const rectHeight = 12 + 1.5 * 2; // Adjust based on the image height


    const rectX = (100 - rectWidth) / 2;
    const rectY = 75;
    ctx.fillStyle = 'rgba(40, 40, 40, 0.75)';
    drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, 5);

    const imageX = rectX + padding;
    const imageY = rectY + (rectHeight - imageHeight) / 2;
    ctx.drawImage(candyImage, imageX, imageY, imageWidth, imageHeight);

    const textX = imageX + imageWidth + (padding - 2);
    const textY = rectY + (rectHeight / 2) + 2.5; // Adjust vertical position for centering
    ctx.fillStyle = '#e8e8e8';
    ctx.textAlign = 'start';
    ctx.fillText(rankPos, textX, textY);

    // Return ctx if background is not hex code or url
    if (!background.startsWith('#') && !background.startsWith('http')) {
        console.log('Returning ctx');
        return ctx;
    }

    return cv.toBuffer();
}

router.get('/rankCardGif', async (req, res) => {
    try {
        console.log('Request received', req.query, req.body, req.params);
        // Get the background gif name that the client wants to get
        const { avatarURL, xp, level, progressBarColor, background, rank } = req.query;

        // Check if any of the required parameters are missing
        if (!avatarURL || !xp || !level || !progressBarColor || !background || !rank) return res.status(400).send('Missing parameters');

        const candyImages = ['purple-candy.png', 'cyan-candy.png', 'yellow-candy.png', 'pink-candy.png', 'blue-candy.png'];
        const randomIndex = Math.floor(Math.random() * candyImages.length);
        const candyImagePath = `${__dirname}/../assets/candies/${candyImages[randomIndex]}`;
        const candyImage = await canvas.loadImage(candyImagePath);
        const width = 200;
        const height = 200;

        // If bg is hexcode
        if (background.startsWith('#')) {
            const buffer = await generateRankCard(avatarURL, xp, level, progressBarColor, background, rank, candyImage);
            return res.send(buffer.toString('base64')).status(200);
        }

        // If bg is img url
        if (background.startsWith('http')) {
            const buffer = await generateRankCard(avatarURL, xp, level, progressBarColor, background, rank, candyImage);
            return res.send(buffer.toString('base64')).status(200);
        }

        // If bg is folder name (gif)
        if (fs.existsSync(`${__dirname}/../assets/rankCardBGs/${background}`)) {
            // Create a new GIF encoder instance
            const encoder = new GIFEncoder(width, height);

            // Create an array to collect the data chunks
            let chunks = [];

            // Set up the event listeners on the encoder's output stream
            encoder.createReadStream().on('data', function (chunk) {
                chunks.push(chunk);
            }).on('end', function () {
                // Combine the chunks into a single Buffer
                console.log
                const gifBuffer = Buffer.concat(chunks);
                return res.send(gifBuffer.toString('base64')).status(200);
            });

            const gifConfig = require(`${__dirname}/../assets/rankCardBGs/${background}/config.json`);

            // Start the encoder
            encoder.start();
            encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
            encoder.setDelay(gifConfig.delay);   // Frame delay in ms
            encoder.setQuality(10); // Image quality, 10 is default    

            const frames = fs.readdirSync(`${__dirname}/../assets/rankCardBGs/${background}`).filter(file => file.endsWith('.png'));
            frames.sort((a, b) => {
                const aNum = parseInt(a.split('-')[1].split('.')[0]);
                const bNum = parseInt(b.split('-')[1].split('.')[0]);
                return aNum - bNum;
            });

            for (frame of frames) {
                const ctx = await generateRankCard(avatarURL, xp, level, progressBarColor, `${__dirname}/../assets/rankCardBGs/${background}/${frame}`, rank, candyImage);
                encoder.addFrame(ctx);
            }

            encoder.finish();
        } else {
            return res.status(400).send('Invalid background');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: 'Internal server error' });
    }
});

router.get('/getEditorSession', async (req, res) => {
    try {
        const { sessionId } = req.query;
        console.log(sessionId)
        if (!sessionId) return res.status(400);

        const session = await editorSession.findById(sessionId);
        if (!session) return res.status(404);

        return res.send(session).status(200);
    } catch (err) {
        console.log(err)
        return res.status(500).send({ error: 'Internal server error' });
    }
})

router.post('/saveRankCard', async (req, res) => {
    try {
        const { sessionId, rankCardData } = req.query;
        if (!sessionId || !rankCardData) return res.status(400);
        console.log(sessionId, rankCardData)

        let rankCardDataJSON;
        try {
            rankCardDataJSON = JSON.parse(rankCardData);
        } catch (error) {
            return res.status(400).send({ error: 'Invalid JSON format' });
        }

        console.log(rankCardDataJSON);

        const session = await editorSession.findById(sessionId);
        if (!session) return res.status(404);
        console.log("valid session")

        const user = await xpUser.findById(`${session.user_id}_1258818895901626468`);
        if (!user) return res.status(404);
        console.log("valid user")

        // Validity checks. Check if strings are empty. Check if progressbar hex, background hex are actually hex codes. If background is not hex code, then check if user has unlocked that background
        if (!rankCardDataJSON.progressBarColor || !rankCardDataJSON.background) return res.status(400).send('Missing parameters');
        console.log("valid params")

        if (!/^#[0-9A-F]{6}$/i.test(rankCardDataJSON.progressBarColor)) return res.status(400).send('Invalid progress bar color');
        console.log("valid progress bar color")
        if (!/^#[0-9A-F]{6}$/i.test(rankCardDataJSON.background)) {
            if (!rankCardDataJSON.background.startsWith('#')) {
                if (!user.rankCard.unlockedBackgrounds.includes(rankCardDataJSON.background)) return res.status(403).send('Background not unlocked');
            }
        }
        console.log("valid background")

        // Update user rank card data
        user.rankCard.progressBarColor = rankCardDataJSON.progressBarColor;
        user.rankCard.background = rankCardDataJSON.background;
        user.rankCard.unlockedBackgrounds = rankCardDataJSON.unlockedBackgrounds;

        await user.save();
        session.rankCardData = rankCardDataJSON;
        await session.save();
        return res.status(200).send({ message: 'Rank card data processed successfully' });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ error: 'Internal server error' });
    }
})

module.exports = router;