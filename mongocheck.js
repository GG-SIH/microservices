var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://apiuser:GGIxKjkRw40UvF18@salmaps.tzbgdtz.mongodb.net/?retryWrites=true&w=majority";

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  var query = {};
  dbo
    .collection("ambulance")
    .find(query)
    .toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
});
