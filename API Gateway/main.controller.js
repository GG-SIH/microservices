const axios = require("axios");

module.exports.userLocatedWithinRadius = async function (req, res) {
  const targetAppUrl = "http://35.221.160.22:30983";
  console.log("body", req.body);
  let currentLocation = req.body.currentLocation;
  let centerPoint = req.body.iwaypoints;
  let radius = req.body.radius;
  let maxRadius = req.body.maxRadius;
  let data = { currentLocation, centerPoint, radius };
  console.log("request data", data);
  let result;
  let returnData = {};
  async function fetchDataUserService(requestData) {
    try {
      const response = await axios.post(targetAppUrl, requestData);
      console.log("Response", response.data);
      result = response.data;
    } catch (error) {
      console.error("Error", error);
    }
  }
  await fetchDataUserService(data);
  returnData.green = result;
  centerPoint = GETImmediateWaypoints[1];
  data = { currentLocation, centerPoint, maxRadius };
  await fetchDataUserService(data);
  returnData.yellow = result;
  res.status(200).json(returnData);
};

module.exports.mainController = async function (req, res) {
  const urlDecodeWaypoints = "http://34.81.63.4:3000";

  const urlDynamicRadius = "http://10.20.129.249:30007";
  const urlGenerateWaypoints = "http://10.20.129.249:30007";
  const urlImmdediateWaypoints = "http://34.128.70.55:3000";

  let polyline = req.body.polyline;

  const requestDataForDecodeWaypoints = { polyline };

  console.log(requestDataForDecodeWaypoints);
  let waypoints = [],
    generatedWaypoints,
    minRadius,
    immediateWaypoint2;
  console.log("in main controller");

  async function fetchDataDecodeService() {
    try {
      const response = await axios.post(
        urlDecodeWaypoints,
        requestDataForDecodeWaypoints
      );
      console.log("Response", response.data);
      waypoints = response.data;
    } catch (error) {
      console.error("Error", error);
    }
  }
  await fetchDataDecodeService();

  // const requestDataForGenerateWaypoints = { decodedPolyline };
  // const requestDataForDynamicRadius = { generatedWaypoints };
  // const requestDataForImmediateWaypoints = { generatedWaypoints };

  // fetch(`${targetAppUrl}`, {
  //   // to be done for decodePolyline
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(requestDataForDecodeWaypoints),
  // })
  //   .then((response) => {
  //     if (response.ok) {
  //       decodedPolyline = response.json();
  //     } else {
  //       throw new Error("Failed to get response from target app");
  //     }
  //   })
  //   .then((data) => {
  //     console.log("Got response from target app:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  // fetch(`${targetAppUrl}/usr/node/gen-service`, {
  //   //generatewaypoints
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(requestDataForGenerateWaypoints),
  // })
  //   .then((response) => {
  //     if (response.ok) {
  //       generatedWaypoints = response.json();
  //     } else {
  //       throw new Error("Failed to get response from target app");
  //     }
  //   })
  //   .then((data) => {
  //     console.log("Got response from target app:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  // fetch(`${targetAppUrl}/usr/node/dyn-service`, {
  //   //dynamicradius
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(requestDataForDynamicRadius),
  // })
  //   .then((response) => {
  //     if (response.ok) {
  //       minRadius = response.json();
  //     } else {
  //       throw new Error("Failed to get response from target app");
  //     }
  //   })
  //   .then((data) => {
  //     console.log("Got response from target app:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  // fetch(`${targetAppUrl}/usr/node/imm-service`, {
  //   //immiediate waypoints
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(requestDataForImmediateWaypoints),
  // })
  //   .then((response) => {
  //     if (response.ok) {
  //       immediateWaypoint2 = response.json();
  //     } else {
  //       throw new Error("Failed to get response from target app");
  //     }
  //   })
  //   .then((data) => {
  //     console.log("Got response from target app:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //   });

  // let maxRadius = minRadius / 2 + minRadius;

  let returnData = {};
  console.log("waypoints 2", waypoints);
  returnData.waypoints = waypoints;
  // returnData.dynamic_radius = minRadius;
  // returnData.immediate_waypoints = immediateWaypoint2;
  // returnData.max_radius = maxRadius;

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
