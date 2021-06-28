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
};
