const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("natural/lib/natural/util/stopwords_id");
const processedData = require("../../data/output.json");

const totalTrainingExamples = processedData.length;
const classCounts = {};
const wordCounts = {};
const classWordCounts = {};

processedData.forEach((item) => {
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
  res.json({
    ulasan: review,
    sentiment: predictedSentiment,
  });
}

async function analyzeAccuracy(req, res) {
  const predictions = processedData.map((item) => {
    return classify(item.review.join(" "));
  });
  // Mendapatkan label sebenarnya dari setiap processedData
  const labels = processedData.map((item) => item.sentiment);
  // Menghitung akurasi
  const accuracy = calculateAccuracy(predictions, labels);
  console.log("Akurasi:", accuracy, "%");
  res.send(`Accuracy : ${accuracy}%`);
}

module.exports = {
  analyzeRequest,
  analyzeAccuracy,
};

// Contoh pengujian pada data uji
