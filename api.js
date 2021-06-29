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
};
