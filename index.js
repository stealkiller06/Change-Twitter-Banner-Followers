// Require all the packages
require('dotenv').config()
const client = require('twitter-api-client');
const axios = require('axios');
const fs = require('fs');
const jimp = require('jimp');
const http = require('http');
const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
let error = 0;
// Your Twitter account
const TWITTER_HANDLE = 'FrankPena_'


const twitterClient = new client.TwitterClient({
  apiKey: process.env.API_KEY,                      //YOUR API KEY
  apiSecret: process.env.API_SECRET,                //YOUR API SECRET 
  accessToken: process.env.CONSUMER_KEY,            //YOUR CONSUMER KEY
  accessTokenSecret: process.env.CONSUMER_SECRET    //YOUR CONSUMER SECRET
});







//push the url of profile image recent followers
let image_url = [];

//check below drawit()
let lastDrawImage = 0;


  // function to draw image and post it
  async function drawImage(back, img1, img2, img3){
  
    //Creating an array so it becomes easier to Promise.all instead of one at a time
    //Would love to see if you have any other approach to this, can't think of anything else
    let imgArr = [back, img1, img2, img3];
  
    let jimps = [];
  
    //Read the image in jimp and push it to jimps array 
    imgArr.forEach(image => jimps.push(jimp.read(image)));
  
    // fetch all the images
   await Promise.all(jimps).then(data => {
      return Promise.all(jimps)
    }).then(data => {
      // composite the images on one another
      data[0].composite(data[1],1070,50); //Your banner is 1500x500px, so change this pixels accordingly
      data[0].composite(data[2],1160,50); //place the images wherever you want on the banner
      data[0].composite(data[3],1250,50); //experiment with it or DM me on Twitter @Deveshb15 if you want any help
  
      // Write the image and save it
      data[0].write('1500x500.png', function(){
        console.log("done");
      })
    })
    .catch(err=>{

      console.log(err) 
      error++;
    })

    if(error > 0) {
      error = 0;
      return;
    }
  
    // encode to base64 to post the image
    const base64 = await fs.readFileSync('1500x500.png', { encoding:'base64' })
  
    // Update the banner

    // console.log(base64);
    await twitterClient.accountsAndUsers.accountUpdateProfileBanner({banner: base64}).catch(err => {
      console.log(err);
    })
  }

async function start() {

  
try{

  const name = Math.random();
  const params = {
    screen_name: TWITTER_HANDLE, //name of twitter account
    count: 3                     //number of followers to be fetched
  }
  // fetch followers
  const data = await twitterClient.accountsAndUsers.followersList(params).catch(err=>{
    console.log(err)
    error ++;
  })

  if(error > 0) {
    error = 0;
    return;
  }
  //push url of profile image to array
  data.users.forEach(item => {
    image_url.unshift(item.profile_image_url_https)
  });

  (async () => {
    //download the image
    // await download_image(image_url[0], `${name}-1.png`)
    // await download_image(image_url[1], `${name}-2.png`)
    // await download_image(image_url[2], `${name}-3.png`)

  async function drawit() {
    lastDrawImage = Date.now();
    // Draw the image and Post it
    await drawImage('1500x500.png' ,image_url[0],image_url[1],image_url[2]).catch(err => {
      console.log(err);
    })
  }
  async function deleteImages() {
    try{
      console.log('removing', `${name}{1,2,3}.png`);
      await fs.unlinkSync(`${name}-1.png`);
      await fs.unlinkSync(`${name}-2.png`);
      await fs.unlinkSync(`${name}-3.png`);
    }catch(e){
      console.log(e);
    }
  }
  const remaining = Date.now() - lastDrawImage;
  
  // Avoid hitting rate limit when update banner
  // 30 requests per 15 mins meaning 1 request per 30 secs
  if (remaining > 30000) {
    await drawit();
  }
  // await deleteImages();




})();

}catch(err){
  console.log(err)
}

}

// start everything
start();
setInterval(() => {
  start(); 
}, 6000);


process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});