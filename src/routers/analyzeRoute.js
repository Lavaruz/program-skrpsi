const router = require("express").Router();
const analzeController = require("../controllers/analyzeController");

router.get("/", analzeController.analyzeAccuracy);
router.get("/history", analzeController.getHistory);
router.post("/", analzeController.analyzeRequest);
router.post("/csv", analzeController.uploadCSV);

module.exports = router;
