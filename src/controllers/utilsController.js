const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");
const { Score, Exam } = require("../models");
const response = require("./response");

async function uploadCSV(req, res) {
  try {
    const siswa = [];
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
          row.password = row.nis + "!##!";
          siswa.push(row);
        })
        .on("end", () => {
          Score.bulkCreate(siswa).then((datas) => {
            return response(201, "add new user", datas, res);
          });
        })
    );
  } catch (error) {
    res.status().json({
      error: error.message,
    });
  }
}

async function exportCSV(req, res) {
  let users = await Score.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: Exam,
        attributes: { exclude: ["createdAt", "updatedAt"] },
        through: {
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      },
    ],
    order: [["username"], [Exam, "createdAt"]],
  });
  if (!fs.existsSync("public/files/exports")) {
    if (!fs.existsSync("public/files")) {
      fs.mkdirSync("public/files");
    }
    if (!fs.existsSync("public/files/exports")) {
      fs.mkdirSync("public/files/exports");
    }
  }

  const csvStream = csv.format({
    headers: true,
  });
  const writableStream = fs.createWriteStream(
    `public/files/exports/nilai-siswa.csv`
  );
  writableStream.on("finish", () => {
    res.json({
      status_code: 200,
      downloadURL: `public/files/exports/nilai-siswa.csv`,
    });
  });
  csvStream.pipe(writableStream);
  if (users.length > 0) {
    users.forEach((user) => {
      if (user.Exams.length !== 0) {
        user.Exams.forEach((exam) => {
          csvStream.write({
            nis: user.nis ? user.nis : 0,
            nama: user.username ? user.username : "",
            kelas: user.class ? user.class : "",
            jurusan: user.major ? user.major : "",
            ujian: exam.exam_name,
            nilai: exam.ScoreExam.point,
            nilai_remedial: exam.ScoreExam.remedial_point,
          });
        });
      } else {
        csvStream.write({
          nis: user.nis ? user.nis : 0,
          nama: user.username ? user.username : "",
          kelas: user.class ? user.class : "",
          jurusan: user.major ? user.major : "",
          ujian: "Belum mengambil ujian",
        });
      }
    });
  }
  csvStream.end();
  writableStream.end();
}

module.exports = {
  uploadCSV,
  exportCSV,
};
