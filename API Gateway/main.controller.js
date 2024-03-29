const axios = require("axios");
let userConfirmation = false;
let GETCurrentLocation;
let ETA;

module.exports.userLocatedWithinRadius = async function (req, res) {
  const targetAppUrl = "http://34.146.57.188:30590";
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
  data = { currentLocation, centerPoint, maxRadius };
  await fetchDataUserService(data);
  returnData.yellow = result;
  res.status(200).json(returnData);
};

module.exports.mainController = async function (req, res) {
  const urlDecodeWaypoints = "http://34.85.33.150:3000";

  const urlDynamicRadius = "http://34.84.88.92:3000";
  const urlGenerateWaypoints = "http://34.84.68.184:3000";
  const urlImmdediateWaypoints = "http://34.146.57.188:3000";

  let polyline = req.body.polyline;

  const requestDataForDecodeWaypoints = { polyline };

  console.log(requestDataForDecodeWaypoints);
  let initialWaypoints = [],
    generatedWaypoints = [],
    minRadius,
    immediateWaypoint2 = [];
  console.log("in main controller");

  async function fetchDataDecodeService() {
    try {
      const response = await axios.post(
        urlDecodeWaypoints,
        requestDataForDecodeWaypoints
      );
      console.log("Response", response.data);
      initialWaypoints = response.data;
    } catch (error) {
      console.error("Error", error);
    }
  }
  await fetchDataDecodeService();

  // generate waypoints
  const requestDataForGenerateWaypoints = { initialWaypoints };
  console.log(requestDataForGenerateWaypoints);
  let waypoints = [];

  async function fetchDataGenerateService() {
    try {
      const response = await axios.post(
        urlGenerateWaypoints,
        requestDataForGenerateWaypoints
      );
      console.log("Response", response.data);
      waypoints = response.data;
    } catch (error) {
      console.error("Error", error);
    }
  }
  await fetchDataGenerateService();

  //dynamic radius
  const requestDataForDynamicRadius = { waypoints };
  console.log(requestDataForDynamicRadius);
  async function fetchDataDynamicService() {
    try {
      const response = await axios.post(
        urlDynamicRadius,
        requestDataForDynamicRadius
      );
      console.log("Response", response.data);
      minRadius = response.data;
    } catch (error) {
      console.error("Error", error);
    }
  }
  await fetchDataDynamicService();
  // immediate waypoints
  const requestDataForImmediateWaypoints = { waypoints };
  console.log(requestDataForImmediateWaypoints);
  async function fetchDataImmediateService() {
    try {
      const response = await axios.post(
        urlImmdediateWaypoints,
        requestDataForImmediateWaypoints
      );
      console.log("Response", response.data);
      immediateWaypoint2 = response.data;
    } catch (error) {
      console.error("Error", error);
    }
  }
  await fetchDataImmediateService();
  let maxRadius = minRadius / 2 + minRadius;

  let returnData = {};
  console.log("waypoints 2", initialWaypoints);
  returnData.initialWaypoints = initialWaypoints;
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

module.exports.notify = function (req, res) {
  GETCurrentLocation = req.body.currentLocation;
  userConfirmation = true;
  let returnData = {};
  console.log(GETCurrentLocation);
  returnData.message = "userLocatedWithinRadius is called123";
  returnData.userConfirmation = userConfirmation;
  res.send(userConfirmation);
};

module.exports.ambulanceReturn = function (req, res) {
  let destination = req.body.destination;
  var axios = require("axios");
  var config = {
    method: "get",
    url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${GETCurrentLocation.lat},${GETCurrentLocation.lng}&destinations=${destination.lat},${destination.lng}&key=AIzaSyB8duqmgKujdQzDlmAnJqHA6G_htRlvrgs`,
    headers: {},
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(
        JSON.stringify(response.data.rows[0].elements[0].duration.text)
      );
      console.log(response.data);
      let eta = JSON.stringify(response.data.rows[0].elements[0].duration.text);
      let returnData = {};
      returnData.currentLocation = GETCurrentLocation;
      returnData.ETA = eta;
      ETA = eta;
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

module.exports.eta = function (req, res) {
  res.status(200).json(ETA);
};
