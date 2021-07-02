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

  app.post("/api/setsocketid", async (req, res) => {
    const obj = ({ matchID, userID, user_socket_id } = req.body);
    var err = "";
    var isHost = false;
    try {
      var snapshot = await admin
        .firestore()
        .collection("searching")
        .doc(userID)
        .get();
      console.log(snapshot.exists);
      //console.log(snapshot.data());
      if (snapshot && snapshot.data() && snapshot.data().match == matchID) {
        isHost = true;
        var update = await admin
          .firestore()
          .collection("searching")
          .doc(userID)
          .update({ host_socket_id: user_socket_id });
      } else {
        var snapshot = await admin
          .firestore()
          .collection("searching")
          .doc(matchID)
          .get();
        if (snapshot && snapshot.data() && snapshot.data().match == userID) {
          var update = await admin
            .firestore()
            .collection("searching")
            .doc(matchID)
            .update({ join_socket_id: user_socket_id });
        }
      }
    } catch (error) {
      err = error;
      console.log(error);
    }

    var ret = { error: err, ishost: isHost };
    res.status(200).json(ret);
  });

  app.post("/api/retrievesockets", async (req, res) => {
    console.log("retrieved sockets");
    const obj = ({ hostID, ishost } = req.body);
    var err = "";
    var sock = "";
    try {
      var snapshot = await admin
        .firestore()
        .collection("searching")
        .doc(hostID)
        .get();
      if (snapshot && snapshot.data() && ishost == "true") {
        sock = snapshot.data().join_socket_id;
      } else if (snapshot && snapshot.data() && ishost == "false") {
        sock = snapshot.data().host_socket_id;
      }
    } catch (error) {
      err = error;
      console.log(error);
    }

    var ret = { error: err, socket_id: sock };
    res.status(200).json(ret);
  });
};
