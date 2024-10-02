const fs = require('fs');
const path = require('path');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');

// XP levels array
const xpLevels = [
  100, 155, 220, 295, 380, 475, 580, 695, 820, 955, 1100, 1260, 1420, 1600,
  1780, 1980, 2180, 2400, 2620, 2860, 3100, 3360, 3620, 3900, 4180, 4480,
  4780, 5100, 5420, 5760, 6100, 6460, 6820, 7200, 7580, 7980, 8380, 8800,
  9220, 9660, 10100, 10560, 11020, 11500, 11980, 12480, 12980, 13500, 14020,
  14560, 15100, 15660, 16220, 16800, 17380, 17980, 18580, 19200, 19820,
  20460, 21100, 21760, 22420, 23100, 23780, 24480, 25180, 25900, 26620,
  27360, 28100, 28860, 29620, 30400, 31180, 31980, 32780, 33600, 34420,
  35260, 36100, 36960, 37820, 38700, 39580, 40480, 41380, 42300, 43220,
  44160, 45100, 46060, 47020, 48000, 48980, 49980, 50980, 52000, 53020,
  54060,
];

// Function to draw rounded rectangles
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Function to generate a rank card
const generateRankCard = async (
  avatarURL,
  xp,
  level,
  progressBarColor,
  background,
  rank,
  candyImage
) => {
  const xpToNextLevel = xpLevels[level];
  const avatar = await loadImage(avatarURL);
  const width = 200;
  const height = 200;

  // Create canvas
  const cv = createCanvas(width, height);
  const ctx = cv.getContext('2d');
  ctx.scale(2, 2);

  // Draw background image
  if (background.startsWith('#')) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 100, 100);
  } else if (background.startsWith('http')) {
    const bg = await loadImage(background);
    ctx.drawImage(bg, 0, 0, 100, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 100, 100);
  } else {
    const bg = await loadImage(background);
    ctx.drawImage(bg, 0, 0, 100, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 100, 100);
  }

  // Progress bar track
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.arc(50, 50, 30, Math.PI * 0.8, Math.PI * 2.2, false);
  ctx.strokeStyle = 'rgba(51, 51, 51, 0.75)';
  ctx.stroke();
  ctx.closePath();

  // Progress bar
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.arc(
    50,
    50,
    30,
    Math.PI * 0.8,
    Math.PI * (0.8 + 1.4 * (xp / xpToNextLevel)),
    false
  );
  ctx.strokeStyle = progressBarColor;
  ctx.stroke();
  ctx.closePath();

  // Avatar background circle
  ctx.beginPath();
  ctx.arc(18, 18, 14, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = '#222222';
  ctx.fill();

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
    xpText = `${(xp / 1000).toFixed(1)}k / ${(xpToNextLevel / 1000).toFixed(
      1
    )}k`;
  }
  ctx.fillText(xpText, 50, 57);

  // Draw rectangle with candy image and rank
  ctx.font = 'bold 7px Georgia';
  const rankPos = `#${rank}`;
  const textMetrics = ctx.measureText(rankPos);
  const textWidth = textMetrics.width;

  const padding = 4; // Space between text, image, and border
  const imageWidth = 12;
  const imageHeight = 12;
  const rectWidth = textWidth + imageWidth + padding * 3;
  const rectHeight = imageHeight + 1.5 * 2;

  const rectX = (100 - rectWidth) / 2;
  const rectY = 75;
  ctx.fillStyle = 'rgba(40, 40, 40, 0.75)';
  drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, 5);

  const imageX = rectX + padding;
  const imageY = rectY + (rectHeight - imageHeight) / 2;
  ctx.drawImage(candyImage, imageX, imageY, imageWidth, imageHeight);

  const textX = imageX + imageWidth + (padding - 2);
  const textY = rectY + rectHeight / 2 + 2.5;
  ctx.fillStyle = '#e8e8e8';
  ctx.textAlign = 'start';
  ctx.fillText(rankPos, textX, textY);

  // Return the context if background is not a hex code or URL
  if (!background.startsWith('#') && !background.startsWith('http')) {
    return ctx;
  }

  return cv.toBuffer();
};

// Main function to process backgrounds and generate GIFs
(async () => {
  // Test values
  const avatarURL = 'https://cdn.discordapp.com/avatars/660409806208630806/a03e59d2e7cd2b6835521e846c55f970.png'; // Replace with a valid path to your avatar image
  const xp = 500;
  const level = 5;
  const progressBarColor = '#00ff00';
  const rank = 1;

  // Load a random candy image
  const candyImages = [
    'purple-candy.png',
    'cyan-candy.png',
    'yellow-candy.png',
    'pink-candy.png',
    'blue-candy.png',
  ];
  const randomIndex = Math.floor(Math.random() * candyImages.length);
  const candyImagePath = path.join(
    __dirname,
    'assets',
    'candies',
    candyImages[randomIndex]
  );
  const candyImage = await loadImage(candyImagePath);

  const width = 200;
  const height = 200;

  // Directory containing background folders
  const backgroundsDir = path.join(__dirname, 'assets', 'rankCardBGs');
  const backgroundFolders = fs
    .readdirSync(backgroundsDir)
    .filter((item) =>
      fs.statSync(path.join(backgroundsDir, item)).isDirectory()
    );

  for (const folder of backgroundFolders) {
    console.log(`Processing background: ${folder}`);

    const backgroundPath = path.join(backgroundsDir, folder);

    // Check if config.json exists
    const configPath = path.join(backgroundPath, 'config.json');
    if (!fs.existsSync(configPath)) {
      console.log(`Skipping folder ${folder}, config.json not found`);
      continue;
    }

    const gifConfig = require(configPath);

    // Create a new GIF encoder instance
    const encoder = new GIFEncoder(width, height);

    const outputPath = path.join(__dirname, `rank_${folder}.gif`);
    const output = fs.createWriteStream(outputPath);

    encoder.createReadStream().pipe(output);

    // Start the encoder
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(gifConfig.delay); // Frame delay in ms
    encoder.setQuality(10); // Image quality

    // Read and sort frame files
    const frames = fs
      .readdirSync(backgroundPath)
      .filter((file) => file.endsWith('.png'))
      .sort((a, b) => {
        const aNum = parseInt(a.split('-')[1].split('.')[0]);
        const bNum = parseInt(b.split('-')[1].split('.')[0]);
        return aNum - bNum;
      });

    // Generate and add frames to the GIF
    for (const frame of frames) {
      const framePath = path.join(backgroundPath, frame);
      const ctx = await generateRankCard(
        avatarURL,
        xp,
        level,
        progressBarColor,
        framePath,
        rank,
        candyImage
      );
      encoder.addFrame(ctx);
    }

    encoder.finish();
    console.log(`Saved GIF to ${outputPath}`);
  }
})();
