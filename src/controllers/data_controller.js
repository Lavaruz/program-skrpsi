const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("natural/lib/natural/util/stopwords_id");

const data = [];
const data_test = [];

fs.createReadStream(path.join(__dirname, "..", "..", "data", "data_label.csv"))
  .pipe(csv())
  .on("data", (row) => {
    const review = row.review_text;
    const sentiment = row.label == 1 ? "positive" : "negative";
    data.push({ review, sentiment });
  })
  .on("end", () => {
    // Melakukan preprocessing pada data di sini
    data.forEach((item) => {
      const reviewTokens = tokenizer.tokenize(item.review);
      const filteredTokens = reviewTokens.filter(
        (token) => !stopwords.words.includes(token.toLowerCase())
      );
      item.review = filteredTokens;
    });

    const jsonData = JSON.stringify(data);
    fs.writeFile("train_data.json", jsonData, (err) => {
      if (err) {
        console.error("Gagal menyimpan data ke file JSON:", err);
      } else {
        console.log("Data berhasil disimpan ke file JSON");
      }
    });
  });

fs.createReadStream(path.join(__dirname, "..", "..", "data", "test_data.csv"))
  .pipe(csv())
  .on("data", (row) => {
    const review = row.review_text;
    const sentiment = row.label == 1 ? "positive" : "negative";
    data_test.push({ review, sentiment });
  })
  .on("end", () => {
    // Melakukan preprocessing pada data di sini
    data_test.forEach((item) => {
      const reviewTokens = tokenizer.tokenize(item.review);
      const filteredTokens = reviewTokens.filter(
        (token) => !stopwords.words.includes(token.toLowerCase())
      );
      item.review = filteredTokens;
    });

    const jsonData = JSON.stringify(data_test);
    fs.writeFile("test_data.json", jsonData, (err) => {
      if (err) {
        console.error("Gagal menyimpan data ke file JSON:", err);
      } else {
        console.log("Data berhasil disimpan ke file JSON");
      }
    });
  });
