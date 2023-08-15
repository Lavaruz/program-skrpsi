$(document).ready(() => {
  let ulasanTable
  // GET HISTORY
  $.get("/api/analyze/history", async (data, status) => {
    if (status == "success") {
      $("#historyTable").DataTable({
        ajax: {
          url: "/api/analyze/history",
          dataSrc: "",
        },
        pageLength: 10,
        lengthMenu: [
          [10, 50, 100, 200, -1],
          [10, 50, 100, 200, "Semua"],
        ],
        columns: [
          {
            data: null,
            render: function (data, type, row, meta) {
              return meta.row + meta.settings._iDisplayStart + 1;
            },
          },
          { data: "ulasan" },
          { data: "sentiment" },
          {
            data: "createdAt",
            render: function (data, type) {
              return data.substring(0, 10);
            },
          },
        ],
      });
    }
  });

  $("#analyze-form").submit(function (e) {
    e.preventDefault();
    const form = new FormData(document.getElementById("analyze-form"));
    $.ajax({
      url: "/api/analyze",
      type: "POST",
      data: form,
      async: false,
      cache: false,
      contentType: false,
      encrypt: "multipart/form-data",
      processData: false,
      success: (response) => {
        $(".analyze-bg").html("");
        $(".analyze-bg").prepend([
          `
              <p>ulasan: "${response.ulasan}"</p>
              ${
                response.sentiment == "positive"
                  ? `<p>hasil: <b style="color: green">${response.sentiment}</b></p>`
                  : `<p>hasil: <b style="color: red">${response.sentiment}</b></p>`
              }
              <button class="analyze-button">OK</button>
            `,
        ]);
        $(".analyze-layer").css("visibility", "visible");
      },
    });
  });
  $(".analyze-layer").on("click", ".analyze-button", function () {
    $(".analyze-layer").css("visibility", "hidden");
    dataTable.destroy();
  });

  // ANALYZE ACCURACY
  const url = "/api/analyze";
  $.get(url, async (data, status) => {
    if (status == "success") {
      let confussion_matrix = data.confusionMatrix;
      $(".api-accuracy-result").append([
        `<h1>${data.accuracy}</h1> <p>True Positive: ${confussion_matrix.truePositive} True Negative: ${confussion_matrix.trueNegative} False Positive: ${confussion_matrix.falsePositive} False Negative: ${confussion_matrix.falseNegative}</p>`,
      ]);
    }
  });

  let data_csv = [];

  //CSV ANALYZE
  $(".analyze-bg-csv .close").click(function () {
    $("#cetak-laporan").html("")
    $(".analyze-layer-csv").css("visibility", "hidden");
  });
  $(".analyze-bg-csv").on("submit", "#cetak-laporan", function (e) {
    e.preventDefault();
    let data = JSON.stringify(data_csv);
    $.ajax({
      url: "/api/utils/export",
      type: "POST",
      data: data,
      contentType: "application/json",
      success: (response) => {
        window.location.href = "files/exports/output.pdf";
      },
    });
  });
  const fileUpload = document.getElementById("fileUpload");
  fileUpload.addEventListener("submit", (e) => {
    e.preventDefault();
    let formData = new FormData(fileUpload);

    $.ajax({
      url: "/api/analyze/csv",
      type: "POST",
      data: formData,
      async: false,
      cache: false,
      contentType: false,
      encrypt: "multipart/form-data",
      processData: false,
      success: (response) => {
        const groupedByMonth = {};
        data_csv = response;
        
        response.forEach(item => {
          if (!groupedByMonth[item.bulan]) {
            groupedByMonth[item.bulan] = [];
          }
          groupedByMonth[item.bulan].push(item);
        });

        let positive = response.filter((e) => e.sentiment == "positive");
        let negative = response.filter((e) => e.sentiment == "negative");
        $(".analyze-layer-csv").css("visibility", "visible");
        $(".analyze-bg-csv").prepend([
          `
            <div class="analyze-resume">
              <div class="analyze-resume-result">
                <p><b>Resume</b></p>
              </div>
              <div class="analyze-report-calc">
                <b>Total Seluruh Ulasan dalam File: ${response.length}</b>
                <p>Sentimen Positif Ditemukan: ${positive.length} (${((positive.length / response.length) * 100).toFixed(2)}%)</p>
                <p>Sentimen Negatif Ditemukan: ${negative.length} (${((negative.length / response.length) * 100).toFixed(2)}%)</p>
                <p>Overall Sentimen: ${positive.length>negative.length?"<b>Positive</b>":"<b>Negative</b>"}</p>
              </div>
            </div>
          `,
        ]);
        $(".analyze-bg-csv").append(`
          <form id="cetak-laporan">
            <p class="text-secondary">*Cetak tabel untuk mengetahui lebih detail terkait analisis</p>
            <button>Cetak Data Tabel</button>
          </form>
        `)

        for (const bulan in groupedByMonth) {
          const ulasanPerBulan = groupedByMonth[bulan];
          let pos = ulasanPerBulan.filter((e) => e.sentiment == "positive");
          let neg = ulasanPerBulan.filter((e) => e.sentiment == "negative");
          let pos_perc = ((pos.length / ulasanPerBulan.length) * 100).toFixed(2)
          let neg_perc = ((neg.length / ulasanPerBulan.length) * 100).toFixed(2)

          $(".customTable").append(`
          <tr>
            <td>${bulan}</td>
            <td>${ulasanPerBulan.length} Ulasan</td>
            <td>${pos.length} Sentimen Positif (${pos_perc}%)</td>
            <td>${neg.length} Sentimen Negatif (${neg_perc}%)</td>
            <td>${pos_perc>neg_perc?"Positif":"Negatif"}</td>
          </tr>
          `)
        }
      },
    });
  });
});
hljs.highlightAll();
