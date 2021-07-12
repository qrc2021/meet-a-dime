const { response } = require("express");

exports.setApp = function (app, admin) {
  app.post("/api/test", async (req, res, next) => {
    ret = { info: "working!" };
    res.status(200).json(ret);
  });

  app.post("/api/firetest", async (req, res) => {
    const snapshot = await admin.firestore().collection("users").get();

    let users = [];
    snapshot.forEach((doc) => {
      let id = doc.id;
      let data = doc.data();

      users.push({ id, ...data });
    });

    res.status(200).send(JSON.stringify(users));
  });

  app.post("/api/addmessage", async (req, res) => {
    var obj = ({
      text: formValue,
      createdAt: createdAt,
      uid: uid,
      photoURL: photoURL,
    } = req.body);

    obj.createdAt = admin.firestore.FieldValue.serverTimestamp();
    var err = "";

    try {
      const snapshot = await admin.firestore().collection("messages").add(obj);
    } catch (error) {
      err = error.message;
    }

    var ret = { error: err };
    res.status(200).json(ret);
  });

  app.post("/api/getuser", async (req, res) => {
    var obj = ({ uid: uid } = req.body);
    console.log("fetched user details for " + uid);
    var err = "";
    var response = "";
    var responseObj = {};
    try {
      const doc = await admin
        .firestore()
        .collection("users")
        .doc(obj.uid)
        .get();
      if (!doc.exists) {
        err = "No user";
        responseObj = { error: err };
      } else {
        var data = doc.data();
        responseObj = {
          birth: data.birth,
          exitMessage: data.exitMessage,
          firstName: data.firstName,
          sex: data.sex,
          sexOrientation: data.sexOrientation,
          photo: data.photo,
          ageRangeMin: data.ageRangeMin,
          ageRangeMax: data.ageRangeMax,
        };
      }
    } catch (error) {
      err = error.message;
      responseObj = { error: err };
    }

    var ret = responseObj;
    res.status(200).json(ret);
  });

  app.post("/api/getbasicuser", async (req, res) => {
    var obj = ({ uid: uid } = req.body);
    console.log("fetched basic user details for " + uid);
    var err = "";
    var response = "";
    var responseObj = {};
    try {
      const doc = await admin
        .firestore()
        .collection("users")
        .doc(obj.uid)
        .get();
      if (!doc.exists) {
        err = "No user";
        responseObj = { error: err };
      } else {
        var data = doc.data();
        responseObj = {
          birth: data.birth,
          firstName: data.firstName,
          sex: data.sex,
          photo: data.photo,
        };
      }
    } catch (error) {
      err = error.message;
      responseObj = { error: err };
    }

    var ret = responseObj;
    res.status(200).json(ret);
  });

  app.post("/api/newuser", async (req, res) => {
    const obj = ({
      email,
      sex,
      sexOrientation,
      phone,
      birth,
      exitMessage,
      userID,
      photo,
      displayName,
      initializedProfile,
      FailMatch,
      SuccessMatch,
      question1Answer,
      question2Answer,
      question3Answer,
      question4Answer,
      question5Answer,
      question6Answer,
      question7Answer,
      question8Answer,
      question9Answer,
      question10Answer,
      question11Answer,
      question12Answer,
      ageRangeMin,
      ageRangeMax,
    } = req.body);

    var err = "";

    if (!req.body.userID || req.body.userID === "") {
      res.status(400).json({ error: "malformed" });
      return;
    }
    try {
      const snapshot = await admin
        .firestore()
        .collection("users")
        .doc(userID)
        .set(obj);
    } catch (error) {
      err = error.message;
    }

    var ret = { error: err };
    res.status(200).json(ret);
  });
};
