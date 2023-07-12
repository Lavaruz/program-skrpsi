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
      $(".api-accuracy-result").append([`<h1>${data}</h1>`]);
    }
  });

  //CSV ANALYZE
  $(".analyze-bg-csv .close").click(function () {
    $(".analyze-layer-csv").css("visibility", "hidden");
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
        $(".analyze-layer-csv").css("visibility", "visible");
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
