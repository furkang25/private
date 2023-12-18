$(document).ready(function () {

  // Abrufen eines Cookies anhand seines Namens
  const getCookie = (name) => {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Funktion zum Erstellen eines Kommentars
  function createComment(projectId, commentText) {
    $.ajax({
      url: `/project/comment/create/${projectId}/`,
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        text: commentText,
      },
      success: function () {
        updateCommentList(projectId);
        $("#commentForm").val("");
        $("#comment").modal("hide");
      },
      error: function (data) {
        console.log(data.error);
      },
    });
  }

  // Funktion zum Aktualisieren eines Kommentars
  function updateComment(projectId, commentId, commentText) {
    $.ajax({
      url: `/project/comment/update/${commentId}/`,
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        text: commentText,
      },
      success: function () {
        updateCommentList(projectId);
        $("#commentForm").val("");
        $("#comment").modal("hide");
      },
      error: function (data) {
        console.log(data.error);
      },
    });
  }

  // Funktion zum Abrufen der Kommentar
  function updateCommentList(project_id) {
    $.ajax({
      url: "/project/project-detail/" + project_id + "/",
      method: "GET",
      success: function (data) {
        $("#commentOutput").empty();
        data.comments.forEach(function (document) {
          var htmlComments = `
                <div class="col-12 mt-5">
                    <figure>
                    <figcaption class="blockquote-footer">
                        <cite title="Source Title" class="user-name">
                        ${document.user} ${
            document.can_edit
              ? `<i data-comment-id="${document.id}" class="changeComment-data fa-regular fa-pen-to-square"></i> <i data-comment-id="${document.id}" class="commentDeleteButton-data fa-solid fa-trash"></i>`
              : ""
          } 
                        </cite>
                    </figcaption>
                    </figure>
                    <small id="commentText">${document.text}</small><br>
                    <small>${document.date}</small>
                    <hr>
                </div>
                `;
          $("#commentOutput").append(htmlComments);
        });
      },
      error: function () {
        console.log("Fehler beim Abrufen der Kommentar.");
      },
    });
  }
  const csrftoken = getCookie("csrftoken");

  // Funktion zum Löschen eines Kommentars
  function deleteComment(commentId, projectId) {
    $.ajax({
      url: `/project/comment/${commentId}/`,
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function () {
        updateCommentList(projectId);
        $("#commentDeleteConfirmModal").modal("hide");
      },
      error: function (data) {
        console.log(data.error);
      },
    });
  }

  $("#createComment").on("click", function () {
    var projectId = $("#bookmarkId").attr("projectBookmark");
    $("#project_id").val(projectId);
    $("#comment").modal("show");
  });

  $("#submitComment").on("click", function (e) {
    e.preventDefault();
    var projectId = $("#project_id").val();
    var commentText = $("#commentForm").val();
    createComment(projectId, commentText);
  });

  $("body").on("click", ".changeComment-data", function () {
    $("#changeComment").removeClass("d-none");
    $("#submitComment").addClass("d-none");
    var projectId = $("#bookmarkId").attr("projectBookmark");
    var commentId = $(this).attr("data-comment-id");
    var commentText = $(this).closest(".col-12").find(".commentText").text();
    $("#comment_id").val(commentId);
    $("#commentForm").val(commentText);
    $("#project_id").val(projectId);
    $("#comment").modal("show");
  });

  $("#changeComment").on("click", function () {
    var projectId = $("#project_id").val();
    var commentId = $("#comment_id").val();
    var commentText = $("#commentForm").val();
    updateComment(projectId, commentId, commentText);
  });

  $("body").on("click", ".commentDeleteButton-data", function () {
    $(this).closest(".col-12").find(".commentText").css("color", "red");
    $("#textDeleteCommment").text("Kommentar löschen bestätigen");
    var projectId = $("#bookmarkId").attr("projectBookmark");
    var commentId = $(this).attr("data-comment-id");
    $("#projektCommentID").val(projectId);
    $("#commentDeleteID").val(commentId);
    $("#commentDeleteConfirmModal").modal("show");
  });

  $("#commentDeleteButton").on("click", function () {
    var commentId = $("#commentDeleteID").val();
    var projectId = $("#projektCommentID").val();
    deleteComment(commentId, projectId);
  });

  $("#commentCloseModal").on("click", function () {
    $("#commentForm").val("");
    $("#user_id").val("");
    $("#project_id").val("");
    $("#comment_id").val("");
  });
});
