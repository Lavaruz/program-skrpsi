const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stopwords = require("natural/lib/natural/util/stopwords_id");

const datas = [];

// fs.createReadStream(path.join(__dirname, "data", "data_label.csv"))
//   .pipe(csv())
//   .on("data", (row) => {
//     const review = row.review_text;
//     const sentiment = row.label == 1 ? "positive" : "negative";
//     data.push({ review, sentiment });
//   })
//   .on("end", () => {
//     // Melakukan preprocessing pada data di sini
//     data.forEach((item) => {
//       const reviewTokens = tokenizer.tokenize(item.review);
//       // const filteredTokens = reviewTokens.filter(
//       //   (token) => !stopwords.words.includes(token.toLowerCase())
//       // );
//       item.review = reviewTokens;
//     });

//     const jsonData = JSON.stringify(data);
//     fs.writeFile("output.json", jsonData, (err) => {
//       if (err) {
//         console.error("Gagal menyimpan data ke file JSON:", err);
//       } else {
//         console.log("Data berhasil disimpan ke file JSON");
//       }
//     });
//   });

fs.readFile(
  path.join(__dirname, "data", "stopword.txt"),
  "utf8",
  (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    // Split the file content into an array of lines
    const lines = data.split("\n");

    // Process the lines array
    console.log("File content as array:");
    lines.forEach((line, index) => {
      datas.push(line);
    });
    console.log(datas);
  }
);
