const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("natural/lib/natural/util/stopwords_id");
const train_data = require("../../data/train_data.json");
const test_data = require("../../data/test_data.json");
const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");
const { History } = require("../models");

const totalTrainingExamples = train_data.length;
const classCounts = {};
const wordCounts = {};
const classWordCounts = {};

train_data.forEach((item) => {
  const { review, sentiment } = item;

  if (!classCounts[sentiment]) {
    classCounts[sentiment] = 0;
    classWordCounts[sentiment] = {};
  }

  classCounts[sentiment]++;

  review.forEach((word) => {
    if (!wordCounts[word]) {
      wordCounts[word] = 0;
    }

    if (!classWordCounts[sentiment][word]) {
      classWordCounts[sentiment][word] = 0;
    }

    wordCounts[word]++;
    classWordCounts[sentiment][word]++;
  });
});

const vocabularySize = Object.keys(wordCounts).length;
const smoothingFactor = 1; // Laplace smoothing factor
// console.log(vocabularySize);

function calculateClassProbability(sentiment) {
  return classCounts[sentiment] / totalTrainingExamples;
}

function calculateWordProbability(word, sentiment) {
  const wordCount = wordCounts[word] || 0;
  const classWordCount = classWordCounts[sentiment][word] || 0;
  return (
    (classWordCount + smoothingFactor) /
    (wordCount + smoothingFactor * vocabularySize)
  );
}

function classify(review) {
  const reviewTokens = tokenizer.tokenize(review);
  const filteredTokens = reviewTokens.filter(
    (token) => !stopwords.words.includes(token.toLowerCase())
  );

  let maxProbability = -Infinity;
  let predictedSentiment = null;

  Object.keys(classCounts).forEach((sentiment) => {
    const classProbability = calculateClassProbability(sentiment);
    let reviewProbability = Math.log(classProbability);

    filteredTokens.forEach((word) => {
      const wordProbability = calculateWordProbability(word, sentiment);
      reviewProbability += Math.log(wordProbability);

      // console.log("review prob: ", reviewProbability);
    });

    if (reviewProbability > maxProbability) {
      maxProbability = reviewProbability;
      predictedSentiment = sentiment;
    }
  });

  return predictedSentiment;
}

function calculateAccuracy(predictions, labels) {
  if (predictions.length !== labels.length) {
    throw new Error("Number of predictions and labels must be the same.");
  }

  const correctPredictions = predictions.filter(
    (prediction, index) => prediction === labels[index]
  );

  const accuracy = (correctPredictions.length / predictions.length) * 100;
  return accuracy.toFixed(2); // Mengembalikan akurasi dengan 2 desimal di belakang koma
}

async function analyzeRequest(req, res) {
  const review = req.body.review;
  const predictedSentiment = classify(review);
  await History.create({
    ulasan: review,
    sentiment: predictedSentiment,
  }).then(() => {
    res.json({
      ulasan: review,
      sentiment: predictedSentiment,
    });
  });
}

async function analyzeAccuracy(req, res) {
  const predictions = test_data.map((item) => {
    return classify(item.review.join(" "));
  });
  // Mendapatkan label sebenarnya dari setiap train_data
  const labels = test_data.map((item) => item.sentiment);
  // Menghitung akurasi
  const accuracy = calculateAccuracy(predictions, labels);
  res.send(`${accuracy}%`);
}

async function uploadCSV(req, res) {
  try {
    const ulasan = [];
    fs.createReadStream(
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "files",
        "uploads",
        req.files[0].filename
      )
    ).pipe(
      csv
        .parse({ headers: true })
        .on("data", (row) => {
          ulasan.push(row);
        })
        .on("end", () => {
          let list_ulasan = ulasan.map((ulas) => {
            return classify(ulas.ulasan);
          });
          let obj = ulasan.map((ulas, index) => {
            return {
              ulasan: ulas.ulasan,
              sentiment: list_ulasan[index],
              bulan: ulas.bulan
            };
          });
          History.bulkCreate(obj);
          res.json(obj);
        })
    );
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

async function getHistory(req, res) {
  try {
    await History.findAll({
      order: [["createdAt", "DESC"]],
    }).then((result) => {
      res.send(result);
    });
  } catch (error) {
    res.json({ error: error.message });
  }
}

function calculateConfusionMatrix(testData) {
  const confusionMatrix = {
    truePositive: 0,
    trueNegative: 0,
    falsePositive: 0,
    falseNegative: 0,
  };

  testData.forEach((item) => {
    const { sentiment } = item;
    const predictedSentiment = classify(item.review.join(" "));

    if (predictedSentiment === sentiment) {
      if (sentiment === "positive") {
        confusionMatrix.truePositive++;
      } else {
        confusionMatrix.trueNegative++;
      }
    } else {
      if (sentiment === "positive") {
        confusionMatrix.falseNegative++;
      } else {
        confusionMatrix.falsePositive++;
      }
    }
  });

  return confusionMatrix;
}

function calculateAccuracyFromConfusionMatrix(confusionMatrix) {
  const { truePositive, trueNegative, falsePositive, falseNegative } =
    confusionMatrix;
  const totalExamples =
    truePositive + trueNegative + falsePositive + falseNegative;
  const accuracy = (truePositive + trueNegative) / totalExamples;
  return accuracy * 100;
}

async function analyzeAccuracy(req, res) {
  try {
    const testData = test_data;
    const confusionMatrix = calculateConfusionMatrix(testData);
    const accuracy = calculateAccuracyFromConfusionMatrix(confusionMatrix);

    res.json({
      confusionMatrix,
      accuracy: `${accuracy.toFixed(2)}%`,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}
module.exports = {
  analyzeRequest,
  analyzeAccuracy,
  uploadCSV,
  getHistory,
};

// Contoh pengujian pada data uji
