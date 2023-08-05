$(document).ready(() => {
  // GET HISTORY
  $.get("/api/analyze/history", async (data, status) => {
    if (status == "success") {
      console.log(data);
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
  });

  // ANALYZE ACCURACY
  const url = "/api/analyze";
  let datas;
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
        data_csv = response;
        let positive = response.filter((e) => e.sentiment == "positive");
        let negative = response.filter((e) => e.sentiment == "negative");
        $(".analyze-layer-csv").css("visibility", "visible");
        $(".analyze-bg-csv").prepend([
          `
          <form id="cetak-laporan">
            <div class="analyze-resume">
              <div class="analyze-resume-result">
                <p><b>Resume</b></p>
                <button>Cetak Table</button>
              </div>
              <div class="analyze-report-calc" style="margin:1rem 0">
                <b>Jumlah total ulasan: ${response.length}</b>
                <p style="color: green;">Jumlah ulasan dengan sentimen positif: ${
                  positive.length
                } (${((positive.length / response.length) * 100).toFixed(
            2
          )}%)</p>
                <p style="color: red;">Jumlah ulasan dengan sentimen negatif: ${
                  negative.length
                } (${((negative.length / response.length) * 100).toFixed(
            2
          )}%)</p>
              </div>
              <p>Kesimpulan:</p>
              <p>
              Berdasarkan analisis sentimen terhadap file CSV yang berisi ulasan-ulasan produk, dapat disimpulkan bahwa mayoritas pengguna memberikan feedback ${
                positive.length > negative.length ? "positif" : "negatif"
              } terhadap produk yang diulas. Sentimen ${
            positive.length > negative.length ? "positif" : "negatif"
          } mendominasi dan menyumbang sekitar ${
            positive.length > negative.length
              ? ((positive.length / response.length) * 100).toFixed(2)
              : ((negative.length / response.length) * 100).toFixed(2)
          }% dari seluruh ulasan yang ada. Hal ini menunjukkan kepuasan pengguna terhadap produk yang mereka beli. Meskipun ada beberapa ulasan dengan sentimen ${
            positive.length < negative.length ? "positif" : "negatif"
          }, namun proporsinya relatif lebih rendah.</p>
            </div>
          </form>
          `,
        ]);
        $("#ulasanTable").DataTable({
          data: response,
          pageLength: 5,
          lengthMenu: [
            [20, 50, 100, 200, -1],
            [20, 50, 100, 200, "Semua"],
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
          ],
        });
      },
    });
  });
});
hljs.highlightAll();
