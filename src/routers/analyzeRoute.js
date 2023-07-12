const router = require("express").Router();
const analzeController = require("../controllers/analyzeController");

router.get("/", analzeController.analyzeAccuracy);
router.post("/", analzeController.analyzeRequest);

module.exports = router;
