const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');

// Define an array of GIF URLs
const urls = [
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjVudmNlczRoeTM2M25xajN3cXlsOXo1ODJnc2pqYmI1bjk5dnQzaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S3UJC9kWXkORi/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXFvNjhqcTFueWgzdG5zZXA2dnl4cmZqM2NsZXJmOGowOTMxYXlzciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPb0gtY8CNU3EW3QvS/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGN5emhianBub3JoYm9tYXpvcGhkbXE3a2k0MHQycnp1czBqZm5lZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7JqCZCuwEYdry/200.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXBwbHNteHA4OHJ6MzFoaGp2d281MjFhdHZ3cWRvNzdmNjA2eTNmdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/k7J8aS3xpmhpK/200w.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWc2OW4zM3NkMHBubmhneWpraG1pY2l2aWxvaTBrbjUwNmUzMThmOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/N4AIdLd0D2A9y/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTgwdm5mcDYzazlscW9kNjU1dmp5YXR3c3ZvNW03dGd4MHg1aTY3cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qDMZrLK5LKZ7xi8/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWppdmN3dG5ram10anMwdzhiYnpqOGtza3Vuem1qOXZrbm9lcWdkdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Cd7Y7tJ4pHbGM/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2Fka2M2YTJjYjY4cDNlZ2Jyb3c2Nmc0cTJoNTcxMnV3OHBzYXRsaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TMruLY1JxyHvO/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXNldmVrcTdta3hkOXd6czYxcjBiazVtMXUwbzFmYXB0cGVkbmptYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbwQHoU2bgWHoLMBzo/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG9jMzFhYjR1b3VrNXp4anVyMzIxcGFrZDhhZWVnNnppdGZsMHN0aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/aY1HMl4E1Ju1y/giphy.gif',

];

async function processUrl(url) {
  try {
    // Generate a random folder name (8 hex characters)
    const folderName = urls.indexOf(url).toString();
    fs.mkdirSync(folderName);

    // Determine file extension from the URL
    const ext = path.extname(url).split('?')[0]; // Handles query parameters

    // Download the image
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const filePath = path.join(folderName, `input${ext}`);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    // Wait until the download is complete
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Extract frames using FFmpeg and resize to 200x200
    const framePattern = path.join(folderName, 'frame-%d.png');

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions('-vsync 0') // Preserves frame timing
        .size('200x200') // Resizes frames to 200x200 pixels
        .output(framePattern)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Compute the delay between frames
    const delay = await getDelay(filePath);

    // Create config.json with the delay
    const config = {
      delay: delay, // in milliseconds
    };
    fs.writeFileSync(
      path.join(folderName, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // Delete the input.gif file
    fs.unlinkSync(filePath);

    console.log(`Processed ${url} and saved frames to ${folderName}`);
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
  }
}

// Function to compute delay using FFprobe
function getDelay(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === 'video'
      );
      if (!videoStream) {
        return reject(new Error('No video stream found'));
      }

      // Get frame rate from FFprobe data
      const rFrameRate = videoStream.r_frame_rate; // e.g., "25/1"
      const [numerator, denominator] = rFrameRate.split('/').map(Number);
      const frameRate = numerator / denominator;

      const delay = 1000 / frameRate; // Convert to milliseconds

      resolve(delay);
    });
  });
}

// Process each URL sequentially
(async () => {
  for (const url of urls) {
    await processUrl(url);
  }
})();

