const app = (module.exports = require("express")());
const { profiles } = require("../helpers/multer");
const userServices = require("../services/user");

app.get("/tokens/:token", async (req, res) => {
  try {
    const user = await userServices.getUserByToken(req.params.token);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.post("/resetpassword", async (req, res) => {
  try {
    await userServices.resetPasswordByPhone(req.body.phone);
    res.status(200).send("");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.post("/socialsignin", async (req, res) => {
  try {
    const { token, user, signup } = await userServices.socialSignIn(req.body);
    res.json({
      token,
      user,
      signup,
    });
    console.log("dwd");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { token, user } = await userServices.signIn(req.body);
    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/:userId/restore", async (req, res) => {
  try {
    res.json(await userServices.restore({ ...req.params, ...req.query }));
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/:userId", async (req, res) => {
  try {
    await userServices.exitUser(req.params);
    res.status(200).send("Success");
  } catch (error) {
    res.status(500).json(error);
  }
});
app.get("/:userId", async (req, res) => {
  try {
    res.json(await userServices.getUserInfo(req.params));
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/:userId", profiles.single("profile"), async (req, res) => {
  try {
    if (req.file && req.file.key) {
      if (req.body.columns && req.body.values) {
        req.body.columns.push("profilePath");
        req.body.values.push(req.file.key);
      } else {
        req.body.columns = ["profilePath"];
        req.body.values = [req.file.key];
      }
    }
    res.json(
      await userServices.put({ ...req.body, userId: req.params.userId })
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/", async (req, res) => {
  try {
    const { token, user } = await userServices.signUp(req.body);
    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});
app.get("/", async (req, res) => {
  try {
    res.json(await userServices.fetch(req.query));
  } catch (error) {
    res.status(500).json(error);
  }
});
