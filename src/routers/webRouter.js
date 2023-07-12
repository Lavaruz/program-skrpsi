const router = require("express").Router();
const { validateRedirect, validateToken } = require("../utils/JWT");

router.get("/", (req, res) => {
  res.render("analyzePage");
});

module.exports = router;
