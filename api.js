exports.setApp = function (app) {
  app.post("/api/test", async (req, res, next) => {
    ret = { info: "working!" };
    res.status(200).json(ret);
  });
};
