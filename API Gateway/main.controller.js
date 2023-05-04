const axios = require("axios");

module.exports.userLocatedWithinRadius = function (req, res) {
  const targetAppUrl = "http://34.128.70.55:30007/";
  console.log("body", req.body);
  let currentLocation = req.body.currentLocation;
  let GETImmediateWaypoints = req.body.iwaypoints;
  let radius = req.body.radius;
  console.log(GETImmediateWaypoints[0]);
  let centerPoint = GETImmediateWaypoints[0];
  let requestData = { currentLocation, centerPoint, radius };
  console.log("request data", requestData);
  let result1, result2;

  //method 1

  let options = {
    method: "POST",
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  fetch(targetAppUrl, options)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));

  //method 2

  async function fetcher() {
    const res1 = await fetch(targetAppUrl, {
      method: "POST",
      timeout: 20000,
    }).then((response) => {
      response.json().then((data) => {
        if (response.status == 200) {
          console.log("error");
        } else {
          console.log(data);
        }
      });
    });
    console.log("res1", res1);
  }
  fetcher();

  //method 3

  // axios
  //   .post(targetAppUrl, requestData)
  //   .then((response) => {
  //     console.log("Response:", response.data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  centerPoint = GETImmediateWaypoints[1];
  requestData = { currentLocation, centerPoint, radius };
  options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  // axios
  //   .post(targetAppUrl, requestData)
  //   .then((response) => {
  //     console.log("Response:", response.data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  // fetch(targetAppUrl, options)
  //   .then((response) => response.json())
  //   .then((data) => console.log(data))
  //   .catch((error) => console.error(error));

  let returnData = {};
  returnData.message = "userLocatedWithinRadius is called";
  returnData.green = result1;
  returnData.yellow = result2;

  res.status(200).json(returnData);
};

module.exports.mainController = function (req, res) {
  const urlDecodeWaypoints = "http://34.101.170.111:3000";
  const urlDynamicRadius = "http://10.20.129.249:30007";
  const urlGenerateWaypoints = "http://10.20.129.249:30007";
  const urlImmdediateWaypoints = "http://34.128.70.55:3000";

  let polyline = req.body.polyline;
  const requestDataForDecodeWaypoints = { polyline };

  let decodedPolyline, generatedWaypoints, minRadius, immediateWaypoint2;

  const requestDataForGenerateWaypoints = { decodedPolyline };
  const requestDataForDynamicRadius = { generatedWaypoints };
  const requestDataForImmediateWaypoints = { generatedWaypoints };

  fetch(`${targetAppUrl}`, {
    // to be done for decodePolyline
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataForDecodeWaypoints),
  })
    .then((response) => {
      if (response.ok) {
        decodedPolyline = response.json();
      } else {
        throw new Error("Failed to get response from target app");
      }
    })
    .then((data) => {
      console.log("Got response from target app:", data);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

  fetch(`${targetAppUrl}/usr/node/gen-service`, {
    //generatewaypoints
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataForGenerateWaypoints),
  })
    .then((response) => {
      if (response.ok) {
        generatedWaypoints = response.json();
      } else {
        throw new Error("Failed to get response from target app");
      }
    })
    .then((data) => {
      console.log("Got response from target app:", data);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

  fetch(`${targetAppUrl}/usr/node/dyn-service`, {
    //dynamicradius
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataForDynamicRadius),
  })
    .then((response) => {
      if (response.ok) {
        minRadius = response.json();
      } else {
        throw new Error("Failed to get response from target app");
      }
    })
    .then((data) => {
      console.log("Got response from target app:", data);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

  fetch(`${targetAppUrl}/usr/node/imm-service`, {
    //immiediate waypoints
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataForImmediateWaypoints),
  })
    .then((response) => {
      if (response.ok) {
        immediateWaypoint2 = response.json();
      } else {
        throw new Error("Failed to get response from target app");
      }
    })
    .then((data) => {
      console.log("Got response from target app:", data);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

  let maxRadius = minRadius / 2 + minRadius;

  let returnData = {};
  returnData.dynamic_radius = minRadius;
  returnData.immediate_waypoints = immediateWaypoint2;
  returnData.max_radius = maxRadius;

  res.status(200).json(returnData);
};

module.exports.nearestAmbulances = function (req, res) {
  const nearest_ambulances = require("./nearest_ambulance.controller");
  // const dispatch_to_all_ambulances = require("./dispatch_to_all.controller");

  let GETUserLng = req.body.Lng;
  let GETUserLat = req.body.Lat;

  // let ambulances = [];
  let returnData = [];
  returnData.ambulances = {};

  let resultSet = nearest_ambulances.calculateNearestAmbulances(
    GETUserLng,
    GETUserLat
  );

  console.log(
    "In Main.Controller: ResultSet = ",
    resultSet.then((value) => (returnData.ambulances += value))
  );

  res.status(200).json(returnData);
};
var userConfirmation = false;
var GETCurrentLocation;
module.exports.notify = function (req, res) {
  GETCurrentLocation = req.body.currentLocation;
  userConfirmation = true;
  let returnData = {};
  returnData.message = "userLocatedWithinRadius is called123";
  returnData.userConfirmation = userConfirmation;
  res.send(userConfirmation);
};

module.exports.ambulanceReturn = function (req, res) {
  let destination = req.body.destination;
  var axios = require("axios");

  var config = {
    method: "get",
    url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${GETCurrentLocation.lat},${GETCurrentLocation.lng}&destinations=${destination.lat},${destination.lng}&key=AIzaSyBcQSmBY1QhFLMcfDHsIFp5YEgdj6I_Ge8`,
    headers: {},
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(
        JSON.stringify(response.data.rows[0].elements[0].duration.text)
      );
      let eta = JSON.stringify(response.data.rows[0].elements[0].duration.text);
      let returnData = {};
      returnData.currentLocation = GETCurrentLocation;
      returnData.ETA = eta;
      res.status(200).json(returnData);
    })

    .catch(function (error) {
      console.log(error);
    });
};

module.exports.notify2 = function (req, res) {
  let returnData = {};
  returnData.userConfirmation = userConfirmation;
  userConfirmation = false;
  res.status(200).json(returnData);
};
