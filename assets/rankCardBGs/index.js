const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { randomBytes } = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const gif = require('modern-gif')

// Define an array of GIF URLs
const urls = [
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXFvNjhqcTFueWgzdG5zZXA2dnl4cmZqM2NsZXJmOGowOTMxYXlzciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JPb0gtY8CNU3EW3QvS/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGN5emhianBub3JoYm9tYXpvcGhkbXE3a2k0MHQycnp1czBqZm5lZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7JqCZCuwEYdry/200.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXBwbHNteHA4OHJ6MzFoaGp2d281MjFhdHZ3cWRvNzdmNjA2eTNmdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/k7J8aS3xpmhpK/200w.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWc2OW4zM3NkMHBubmhneWpraG1pY2l2aWxvaTBrbjUwNmUzMThmOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/N4AIdLd0D2A9y/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTgwdm5mcDYzazlscW9kNjU1dmp5YXR3c3ZvNW03dGd4MHg1aTY3cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qDMZrLK5LKZ7xi8/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWppdmN3dG5ram10anMwdzhiYnpqOGtza3Vuem1qOXZrbm9lcWdkdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Cd7Y7tJ4pHbGM/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2Fka2M2YTJjYjY4cDNlZ2Jyb3c2Nmc0cTJoNTcxMnV3OHBzYXRsaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TMruLY1JxyHvO/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXNldmVrcTdta3hkOXd6czYxcjBiazVtMXUwbzFmYXB0cGVkbmptYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mbwQHoU2bgWHoLMBzo/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG9jMzFhYjR1b3VrNXp4anVyMzIxcGFrZDhhZWVnNnppdGZsMHN0aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/aY1HMl4E1Ju1y/giphy.gif',
  'https://media.tenor.com/9HIn3UQuOYcAAAAM/athousandyearsofdeath-naruto.gif',
  'https://i.pinimg.com/originals/c0/7c/28/c07c28b2f57bc12ec07d947c8877bfe7.gif',
  'https://gifsec.com/wp-content/uploads/2022/10/cute-anime-girl-3.gif',
  'https://64.media.tumblr.com/d69cc514d328a473b75e20387db801d7/tumblr_n5dr8gTaFs1qitjclo1_500.gif',
  'https://i.pinimg.com/originals/45/01/ff/4501ffa9c2b5742e216d3a6bf44c83d8.gif',
  'https://64.media.tumblr.com/b3b2020fe2ed9b1ae3dfccc932fa0e61/tumblr_pwe9tu9ReA1toni03o1_r1_540.gif',
  'https://media1.tenor.com/m/H8sFCwcrb6UAAAAC/bruh.gif',
  'https://img.wattpad.com/5ecc494f9da3ed767d96a812c034fbd2b9b3b3e4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f51305a51334c357a2d426a4334773d3d2d313136373030363936392e313663323564656336323734383563373139303537363734323035352e676966',
  'https://giffiles.alphacoders.com/218/218635.gif',
  'https://i.pinimg.com/originals/67/84/ba/6784ba43e084d8bf643f382762b7bab4.gif',
  'https://64.media.tumblr.com/c368d5480aaf59f0563d0cf6ec439488/90d546977c3c813e-46/s540x810/da9999b77dd3bfca65f6a3295b8ea08f61396904.gif',
  'https://media.tenor.com/rYCwqsWHgrYAAAAM/dipper-pines-gravity-falls.gif',
  'https://i.makeagif.com/media/11-09-2015/jTVjv6.gif',
  'https://i.pinimg.com/originals/9b/d7/b1/9bd7b1e2756ebb8b3162e3c466891a64.gif',
  'https://static.wikia.nocookie.net/cocomelon/images/4/4d/Cocomelon-66-dancing-monkey-acegif.gif/revision/latest/scale-to-width-down/335?cb=20240101130906',
  'https://media1.tenor.com/m/ORg_Ai1TWPUAAAAC/rainbow-spongebob.gif',
  'https://media.tenor.com/ORg_Ai1TWPUAAAAM/rainbow-spongebob.gif',
  'https://steamuserimages-a.akamaihd.net/ugc/1008187911191846513/E8D55D83CA0C4663B5566FD9DC6E499F4F93AAC4/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnYzd3Zhb2x0Z3owNHVjNjhiOHpocHlrOTl0d25mem1ya3RqYWx3ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/r88w2d7tHqazFwNEGN/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWI0OGxyc2tremJxdWx3anB2eDk4cWFqdDlqODF5d241ZTNndnMydSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjHB1lWgaM1WJ4fS/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWNmNGpmZzBvbWl2ZHd6ZWM0ZWJ3NjcwaGR0NTdsZGRmYzNoaXpkMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/25DE7hO60crBeE8Jlc/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BycGlwM3Z3aXpuank1cGR4a21rMjBzeG13dDM1bm56cWRmZGlhZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4x7ar0aa0XwgU/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Q5b2c5dnU0cDlzZGliZ3Z0cWFxenlhMXlwdDFqOWd2b2E0b2ZtYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IFrHkIglEOg8Ba/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbW5vYXB5b2ZsNzh4dXFhaXFyZGpucDhsODJ6cGRzaTcyMms5MmdibyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nHyZigjdO4hEodq9fv/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTBkbDkyYjN6bWhwYXYzZzhrY2p3N2FlMWQxbHJiOXJxenE2YmkzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eMsdwTiWGnCnQ12HMd/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2wyZjN2b2U3NmVzZjk0OXRubWJybnRwdmpnbmc0MjBxbHI0ZnFxcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ymtm7S6hu9OJDgyPZ4/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnFkc291YnNvcG9jdHp6bDVlNTA2MnY3MG82bnh1NXpmYnkxdXk3aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RtdRhc7TxBxB0YAsK6/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjVpcXc2cGwyZjZoM3V6NnNhaHRibnptc2trNHk5OXVubDZ0bDJ1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/U3GIQNy1wEWx74G7UH/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTg5ZWx3d3NqeTFhZGEwbXZlMmRsZDd5cDVreTl2dnduMW80aXh2ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Sze7YjOJjS24w/giphy.gif',
  'https://media0.giphy.com/media/1xNApQKoX1uW2vhVE9/200.gif?cid=ecf05e47u82ir3edimsne2kgu09n8p3n3h0riiqrl8rdw4o3&ep=v1_gifs_related&rid=200.gif&ct=g',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExczd6dmgyN3NpZWt3ZHo3cjIxaGQ4MWh6bjZlYWp2NDBqd3M5Ym1kbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2qUmObAJLukgUYa7oo/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNlaWxzb3o1ZWxranN6aG0zNHgwNDduanptNHFvaDcxMnFocXhuZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/139eZBmH1HTyRa/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjI2OGRuaTM4YzV2Z2s4dTR4NGZ3ZDVxeHZxcGEyNmJ1ZjQ2bjdiZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/25oFarLxPqrNS/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjY3dG5zNjRjNTZxa3Z1amx5NHZtY2sxaTR1d2tianN3MnNkamlrbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h71k5t5eo4ZaDMgzbs/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2pnbWNybmZpNm5wNzVsZjUwNWZyY3Z0MGQ3emplZWFqNHhmMWt3dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/U6eoLNZsnCHdM1fOq9/200.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnJ1d2JjcnFkZXpvYnRzZ3ZwcXU5ejd0MXZ6YzN6bXF1aGFsN2J6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lPS3b0XePyBxiX2uUq/200.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmJiZHh1NzA1MmFhYXhtZ3J2YjhqeW9oMnlzaTRobmY1eXJkc3dhZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QyjFTYiQIc0Qkz2iZ5/giphy.gif',
  'https://media1.giphy.com/media/gFPxNhzEWdFCCRAqf0/giphy.gif?cid=6c09b95286h37moi6qzs3y0orzv619oesogyjd61zkrzxv74&ep=v1_gifs_search&rid=giphy.gif&ct=g',
  'https://i.imgur.com/0QwMCKR.gif',
  'https://gifdb.com/images/featured/purple-aesthetic-ey7kbfyqur1qn76d.gif',
  'https://wallpapercave.com/wp/wp6529612.gif',
  'https://cdn.imagearchive.com/alonelylife/data/attach/7/7036-roses-aesthetic.gif',
  'https://i.pinimg.com/originals/d8/9b/bc/d89bbc64bf0859b0b54e7397b316199f.gif',
  'https://giffiles.alphacoders.com/220/220115.gif',
  'https://steamuserimages-a.akamaihd.net/ugc/2286207513866139079/07CD0C4A756A9779C0354C2A9C5C83D0B9D2F785/?imw=268&imh=268&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true',
  'https://media1.tenor.com/m/P1gzXH98ZqEAAAAC/pop-cat.gif',
  'https://media1.tenor.com/m/shjchADOxPcAAAAC/skeleton-dance.gif',
  'https://media1.tenor.com/m/587AABroBfwAAAAC/dance-skeleton.gif',
  'https://media1.tenor.com/m/gotOLnyvy4YAAAAC/bubu-dancing-dance.gif',
  'https://media1.tenor.com/m/yNMGjXsoYGUAAAAd/cat-cats.gif',
  'https://media1.tenor.com/m/VgJYBd0LXkkAAAAC/cat-smacking-cat-gif.gif',
  'https://media1.tenor.com/m/haNFtdJJ7WcAAAAd/cat.gif',
  'https://media1.tenor.com/m/DM7SdBiQKhEAAAAd/cat-underwater.gif',
  'https://media1.tenor.com/m/Myi3a3NLehYAAAAC/gato-pato.gif',
  'https://i.gifer.com/embedded/download/5J46.gif',
  'https://i.pinimg.com/originals/70/0f/c1/700fc139196efa9b8d755e95b2dcbfc8.gif',
  'https://i.pinimg.com/originals/d2/74/53/d27453bc639e176b4d6a8484b491dd77.gif',
  'https://media0.giphy.com/media/rzeWnbH8Uc5Y4/200w.gif?cid=6c09b952c3z5rsw8o2y705p0krjlg0vzx3ywla61k4luxthk&ep=v1_gifs_search&rid=200w.gif&ct=g',
  'https://media0.giphy.com/media/l1J3G5lf06vi58EIE/giphy.gif?cid=6c09b952vft90g41cmctcw82d4wiwfixvuwp1jwracib2l4s&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
  'https://media.tenor.com/4sg3zc2RXgUAAAAM/jmd-japanese-cars.gif',
  'https://cdn.dribbble.com/users/1201592/screenshots/5329858/80s-car.gif',
  'https://media.tenor.com/zJCAajYqz1gAAAAM/dancing-dragon-wiggle.gif',
  'https://media.tenor.com/EbfWqDxOwwoAAAAM/how-to-train-your-dragon-toothless.gif',
  'https://i.pinimg.com/originals/07/6f/8e/076f8e8b3762b60fe451314fff33ae2c.gif',
  'https://media0.giphy.com/media/Ypqx7556UkNqg/200w.gif?cid=8d8c0358xz9nwccdtroyzudno2j2s9oi1nfz66citxsbf8mn&ep=v1_gifs_search&rid=200w.gif&ct=g',
];

async function processUrl(url) {
  try {
    // Generate a random folder name (8 hex characters)
    const folderName = '33ab';
    if (fs.existsSync(folderName)) {
      fs.rmdirSync(folderName, { recursive: true });
    }
    fs.mkdirSync(folderName);

    // Determine file extension from the URL
    const ext = path.extname(url).split('?')[0]; // Handles query parameters

    // Download the image
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const filePath = path.join("downloads", `${folderName}${ext}`);
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

    // Gif to array buffer
    const buffer = fs.readFileSync(filePath);

    // Compute the delay between frames
    const delay = await gif.decodeFrames(buffer)[0].delay;

    // Create config.json with the delay
    const config = {
      delay: delay, // in milliseconds
    };
    fs.writeFileSync(
      path.join(folderName, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // // Delete the input.gif file
    // fs.unlinkSync(filePath);

    console.log(`Processed ${url} and saved frames to ${folderName}`);
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
  }
}

// Process each URL sequentially
(async () => {
  for (const url of urls) {
    await processUrl(url);
  }
})();
