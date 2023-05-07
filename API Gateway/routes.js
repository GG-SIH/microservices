const express = require("express");
const router = express.Router();
var appController = require("./main.controller");

router.get("/", (req, res) => {
  res.send("we are in alarms router");
});

router.route("/mainController").post(appController.mainController);

router
  .route("/userLocatedWithinRadius/")
  .post(appController.userLocatedWithinRadius);

router.route("/nearestAmbulance").post(appController.nearestAmbulances);

router.route("/confirmUser").post(appController.notify);
router.route("/confirmAmbulance").post(appController.notify2);
router.route("/ambulanceReturn").post(appController.ambulanceReturn);
router.route("/eta").get(appController.eta);

module.exports = router;
