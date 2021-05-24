"use strict";
// Library imports
var request = require("request");
var Push = require("pushover-notifications");
var intervalObj;

const model = "MHP13LL/A"; // Space Gray 12.9 inch iPad Pro 2021 (M1)
const friendlyName = "Space Gray";
// const model = "MHP23LL/A"; // Silver 12.9 inch iPad Pro 2021 (M1)
// const friendlyName = "Silver";
// const model = "MHN13LL/A"; // 11 inch iPad Pro 2021 (M1)
const appleStoreBuyUrl =
  "https://www.apple.com/shop/buy-ipad/ipad-pro/12.9-inch-display-1tb-silver-wifi-cellular";
const zipcode = "76502";

const apiUrl = `https://www.apple.com/shop/fulfillment-messages?pl=true&parts.0=${model}&location=${zipcode}`;

const PUSHOVER_TOKEN = "your-token"; // os.getenv('PUSHOVER_TOKEN')
const PUSHOVER_USER = "your-token"; // me | os.getenv('PUSHOVER_USER')

function pushStore(store) {
  console.log(`${friendlyName} is now available at a location near ${zipcode}`);
  const title = `${friendlyName} available near ${zipcode}`;
  const message = `${store.storeDistanceVoText}`;
  const url = appleStoreBuyUrl;
  const urlTitle = `Apple Store 'Buy' URL for ${friendlyName}`;
  const p = new Push({
    user: PUSHOVER_USER,
    token: PUSHOVER_TOKEN,
    // httpOptions: {
    //   proxy: process.env['http_proxy'],
    //},
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
  });

  const msg = {
    message: message,
    title: title,
    sound: "pushover",
    // device: 'test_device',
    priority: 1,
    // retry: 30,
    // expire: 10800,
    url: url,
    url_title: urlTitle,
  };

  p.send(msg, function (err, result) {
    if (err) {
      throw err;
    } else {
      console.log("Wait a minute before we check again");
      clearInterval(intervalObj);
      setTimeout(() => {
        intervalObj = setInterval(() => {
          callAPI(apiUrl);
        }, 10000);
      }, 60000);
    }

    console.log(result);
  });
}

function handleAPIResponse(res) {
  // console.log("body", res.body.content.pickupMessage.stores);

  // console.log(`Checking for ${friendlyName}`);
  const stores = res.body.content.pickupMessage.stores;

  var storesWithProductAvailable = stores.filter(
    (store) => store.partsAvailability[model].pickupDisplay == "available"
  );

  storesWithProductAvailable.forEach((store) => pushStore(store));
}

// Call the API
function callAPI(url) {
  var headers = {
    "Content-Type": "application/json",
  };

  var options = {
    url: url,
    method: "GET",
    headers: headers,
    body: null,
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      handleAPIResponse(JSON.parse(body));
    } else {
      console.log(error, response);
    }
  }

  // Make the API request
  request(options, callback);
}

console.log(`Monitoring ${friendlyName} availability`);
intervalObj = setInterval(() => {
  callAPI(apiUrl);
}, 5000);
