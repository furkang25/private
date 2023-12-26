$(document).ready(function () {
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

  // Erstellen eines Kommentars mit AJAX-Anfrage
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

  // Aktualisieren eines Kommentars mit AJAX-Anfrage
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

  // Abrufen Kommentar mit AJAX-Anfrage
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
        console.log("Fehler beim Abrufen des Kommentars.");
      },
    });
  }
  const csrftoken = getCookie("csrftoken");

  // Löschen eines Kommentars mit AJAX-Anfrage
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

  // Öffnet das Kommentarformular, wenn createComment geklickt wird
  $("#createComment").on("click", function () {
    var projectId = $("#bookmarkId").attr("projectBookmark");
    $("#project_id").val(projectId);
    $("#comment").modal("show");
  });

  // Kommentar erstellen, wenn submitComment geklickt wird
  $("#submitComment").on("click", function (e) {
    e.preventDefault();
    var projectId = $("#project_id").val();
    var commentText = $("#commentForm").val();
    createComment(projectId, commentText);
  });

  // Kommentar bearbeiten, wenn Elemente von .changeComment-data geklickt wird
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

  // Kommentar aktualisieren, wenn changeComment geklickt wird
  $("#changeComment").on("click", function () {
    var projectId = $("#project_id").val();
    var commentId = $("#comment_id").val();
    var commentText = $("#commentForm").val();
    updateComment(projectId, commentId, commentText);
  });

  // Bestätigung für die Löschung eines Kommentars in rot
  $("body").on("click", ".commentDeleteButton-data", function () {
    $(this).closest(".col-12").find(".commentText").css("color", "red");
    $("#textDeleteCommment").text("Kommentar löschen bestätigen");
    var projectId = $("#bookmarkId").attr("projectBookmark");
    var commentId = $(this).attr("data-comment-id");
    $("#projectCommentId").val(projectId);
    $("#commentDeleteID").val(commentId);
    $("#commentDeleteConfirmModal").modal("show");
  });

  // Kommentar löschen, wenn commentDeleteButton geklickt wird
  $("#commentDeleteButton").on("click", function () {
    var commentId = $("#commentDeleteID").val();
    var projectId = $("#projectCommentId").val();
    deleteComment(commentId, projectId);
  });

  // Kommentar Modal leeren
  $("#commentClose").on("click", function () {
    $("#commentForm").val("");
    $("#user_id").val("");
    $("#project_id").val("");
    $("#comment_id").val("");
  });
});
