$(document).ready(() => {
  introJs()
    .setOptions({
      dontShowAgain: true,
      steps: [
        {
          title: "Ubah data siswa?",
          intro:
            "Halaman ini berfungsi untuk mengubah data siswa yang tersedia",
        },
        {
          element: document.querySelector(".main-input"),
          intro:
            "Berikut adalah data yang tersimpan dari siswa yang dipilih, kalian dapat mengubahnya kapanpun",
          position: "left",
        },
        {
          element: document.querySelector(".exams-assign"),
          intro:
            "form ini berisikan ujian apa yang terdaftar untuk siswa tersebut, semua ujian yang tersedia akan ditampilkan dalam form ini, centang untuk membuat siswa terdaftar diujian",
        },
        {
          element: document.querySelector("#selesai"),
          intro: "tekan selesai apabila yakin dengan perubahan",
          position: "left",
        },
      ],
    })
    .start();

  const d = new Date();
  let text;
  text = d.toLocaleString("id-ID", {
    dateStyle: "medium",
  });
  $("#date").html(text);

  // ADD SOAL

  $("#selesai").on("click", () => {
    $(".submit-layer").css("visibility", "visible");
  });

  $(".ubah-button").on("click", () => {
    $(".submit-layer").css("visibility", "hidden");
  });

  // GET URL
  let unique_id = window.location.href.substring(
    window.location.href.lastIndexOf("/") + 1
  );
  let url_input = `/api/scores/${unique_id}`;
  let url_ujian = `/api/exams`;
  let user_data;
  // SET INPUT
  $.get(url_input, async (data, status) => {
    let datas = data.payload.datas;
    user_data = data.payload.datas;
    if (status == "success" && datas.length !== 0) {
      $("#nis").val(datas.nis);
      $("#username").val(datas.username);
      $("#class").val(datas.class);
      $("#major").val(datas.major);
      if (datas.Exams) {
        datas.Exams.forEach((exam) => {
          $(".exams-assign").on("click", `#${exam.exam_name}`, function () {});
        });
      }
    }
  });
  // SET UJIAN
  $.get(url_ujian, async (data, status) => {
    let datas = data.payload.datas;
    if (status == "success" && datas.length !== 0) {
      $(".exams-assign").html("");
      datas.forEach((data, index) => {
        $(".exams-assign").append([
          `
              <div class="exam-assign">
                <label for="${data.exam_name}">${data.exam_name}</label>
                <input type="checkbox" name="${data.unique_id}" id="${data.unique_id}" />
              </div>`,
        ]);
        $(".exams-assign").on("change", "#" + data.unique_id, function () {
          if (!$("#" + data.unique_id).is(":checked")) {
            $(this).html(
              `<input type="hidden" name="${data.unique_id}" id="${data.unique_id}" value="off" />`
            );
          } else {
            $("#" + data.unique_id).val("on");
          }
        });
        // CHEKED
      });
      user_data.Exams.forEach((user_exam) => {
        if (datas.find((e) => e.exam_name == user_exam.exam_name)) {
          $(`#${user_exam.unique_id}`).prop("checked", true);
        }
      });
    }
  });

  // SUBMIT
  const manualForm = document.getElementById("submit-form");
  manualForm.addEventListener("submit", (e) => {
    let formData = new FormData(manualForm);
    formData.append("unique_id", unique_id);
    e.preventDefault();
    $.ajax({
      url: "/api/scores/edit",
      type: "POST",
      data: formData,
      async: false,
      cache: false,
      contentType: false,
      encrypt: "multipart/form-data",
      processData: false,
      success: (response) => {
        if (response.payload.status_code == 200) {
          window.location = "/siswa";
        } else if (response.payload.message == "you're not authenticated") {
          window.location = "/login";
        }
      },
    });
  });
});
