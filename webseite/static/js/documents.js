$(document).ready(function () {
  function documentParameterRemove() {
    if (window.location.search.indexOf("documents_open_modal=true") !== -1) {
      var newUrl = window.location.href.replace(
        "?documents_open_modal=true",
        ""
      );
      history.pushState({}, document.title, newUrl);
      location.reload();
    }
  }

  $("#closeDocument").click(function () {
    documentParameterRemove();
    console.log("run");
  });

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

  const csrftoken = getCookie("csrftoken");

  function checkDocumentsWatchlistStatus(user_id, documentId) {
    var user_id = user_id;
    var project_id = documentId;

    $.ajax({
      url:
        "/documents/check-watchlist-status/" + user_id + "/" + project_id + "/",
      type: "GET",
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        var iconElement = $(
          '.bookmarkDocumentId[data-documents-bookmark="' + documentId + '"]'
        );

        var isOnWatchlist = data.is_on_watchlist || false;

        if (isOnWatchlist) {
          iconElement.addClass("isWatchlist");
        } else {
          iconElement.removeClass("isWatchlist");
        }
      },
      error: function (error) {},
    });
  }

  function openModalIfParameterExists() {
    var urlParams = new URLSearchParams(window.location.search);
    var openModal = urlParams.get("documents_open_modal");

    if (openModal === "true") {
      $("#uploadDocument").modal("show");
    }
  }
  openModalIfParameterExists();

  $("#documentCards").on("click", ".document-bookmark", function () {
    var document_id = $(this).attr("data-documents-bookmark");
    var user_id = $("#loginUserId").val();

    $.ajax({
      url: "/documents/toggle-watchlist/",
      method: "POST",
      data: { user_id: user_id, document_id: document_id },
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        checkDocumentsWatchlistStatus(user_id, document_id);
      },
      error: function () {
        console.log("Fehler beim Ändern der watch list.");
      },
    });
  });

  $("body").on("click", ".documents-delte-btn", function () {
    $("#deleteModal").modal("hide");

    var documentsDeleteId = $(this).data("documents-delete-id");
    console.log(documentsDeleteId);

    $.ajax({
      url: `/documents/delete/${documentsDeleteId}/`,
      method: "POST",
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        setTimeout(function () {
          location.reload();
        }, 100);
      },
      error: function () {
        console.error("Fehler bei der Ajax-Anfrage.");
      },
    });
  });

  $("#documentCards").on("click", ".custome-documents", function () {
    var dataDocuments = $(this).attr("data-documents-id");

    $("#uploadDocument").modal("show");
    $("#deleteButton").removeClass("d-none");
    $("#saveButtonDocument").addClass("d-none");
    $("#dropzoneDocument").addClass("d-none");
    $("#updateButtonDocument").removeClass("d-none");

    $.ajax({
      url: `/documents/update/${dataDocuments}/`,
      method: "GET",
      dataType: "json",

      success: function (data) {
        $("#documentHiddenId").val(data.documents.id);
        $("#projectNameForm").val(data.documents.project);
        $("#projectHiddenId").val(data.documents.project_id);
        $("#tagHiddenId").val(data.documents.tags_id);
        $("#tagFormDocumentDocument").val(data.documents.tags_name);
        $("#documentNameForm").val(data.documents.name);
        $("#documentesDelete").attr(
          "data-documents-delete-id",
          data.documents.id
        );
      },
      error: function () {
        console.error("Fehler bei der Ajax-Anfrage.");
      },
    });
  });

  $("#updateButtonDocument").on("click", function () {
    var projectHiddenId = $("#projectHiddenId").val();
    var tagHiddenId = $("#tagHiddenId").val();
    var teamHiddenId = $("#teamHiddenId").val();
    var documentNameForm = $("#documentNameForm").val();
    var dataDocuments = $("#documentHiddenId").val();
    console.log(dataDocuments);

    var updatedData = {
      name: documentNameForm,
      tags: tagHiddenId,
      project: projectHiddenId,
      team: teamHiddenId,
    };

    $.ajax({
      url: `/documents/update/${dataDocuments}/`,
      method: "POST",
      data: updatedData,
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        setTimeout(function () {
          location.reload();
          documentParameterRemove();
        }, 100);
      },
      error: function () {
        console.error("Fehler bei der Ajax-Anfrage.");
      },
    });
  });

  $("#teamForm").on("change", function () {
    $("#teamHiddenId").val("");
  });

  $("#projectNameForm").on("change", function () {
    $("#projectHiddenId").val("");
  });

  $("#tagFormDocumentDocument").on("change", function () {
    $("#tagHiddenId").val("");
  });

  var currentPage = 1;
  var isUser = false;
  var onlyWatchlist = false;

  $(document).ready(function () {
    filterDocumentsByTags(currentPage);
  });

  $(document).on("click", ".pagination-link", function () {
    var page = parseInt($(this).data("page"));
    filterDocumentsByTags(page);
  });

  function createPaginationLinks(pageCount) {
    var paginationContainer = $("#paginationContainer");
    paginationContainer.empty();

    var previousPageLink = $(
      '<li class="page-item"><a class="page-link" href="javascript:void(0);" data-page="1">Previous</a></li>'
    );
    paginationContainer.append(previousPageLink);

    for (var i = 1; i <= pageCount; i++) {
      var pageLink = $(
        '<li class="page-item"><a class="page-link pagination-link" href="javascript:void(0);" data-page="' +
          i +
          '">' +
          i +
          "</a></li>"
      );

      if (i === currentPage) {
        pageLink.addClass("active");
      }

      paginationContainer.append(pageLink);
    }

    var nextPageLink = $(
      '<li class="page-item"><a class="page-link" href="javascript:void(0);" data-page="' +
        pageCount +
        '">Next</a></li>'
    );
    paginationContainer.append(nextPageLink);
  }

  function filterDocumentsByTags(page) {
    var searchQuery = $("#searchQuery").val();
    var selecteUser = $("#selectUser").val();
    var selectedTags = $("#selectTags").val();
    var dateFrom = $("#datepickerFrom").val();
    var dateTo = $("#datepickerTo").val();
    var page = parseInt(page);
    var dataToSend = {};

    if (searchQuery && searchQuery.length >= 4) {
      dataToSend.search_query = searchQuery;
    }

    if (selectedTags && selectedTags.length > 0) {
      dataToSend.selected_tags = selectedTags;
    }

    if (selecteUser && selecteUser.length > 0) {
      dataToSend.selecteUser = selecteUser;
    }

    var dateFromMoment = moment(dateFrom, "DD.MM.YYYY");
    var dateToMoment = moment(dateTo, "DD.MM.YYYY");
    if (dateFromMoment.isValid() && dateToMoment.isValid()) {
      dataToSend.date_from = dateFromMoment.format("YYYY-MM-DD");
      dataToSend.date_to = dateToMoment.format("YYYY-MM-DD");
    }

    $.ajax({
      url: "/documents/list/",
      method: "GET",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        selected_tags: selectedTags,
        date_from: dataToSend.date_from,
        date_to: dataToSend.date_to,
        search_query: searchQuery,
        selected_user: dataToSend.selecteUser,
        is_user: isUser,
        show_watchlist: onlyWatchlist,
        project_id: projectIdVal,
        page: parseInt(page),
      },
      success: function (data) {
        currentPage = page;

        var documentCards = $("#documentCards");
        documentCards.empty();
        const documentsRow = $('<div class="row"></div>');

        data.documents.forEach((element) => {
          const tagsString = Array.isArray(element.tags)
            ? element.tags.join(", ")
            : "";

          if (onlyWatchlist && !element.is_on_watchlist) {
            return;
          }

          var userLogin = $("#loginUserId").val();
          documentId = element.id;
          checkDocumentsWatchlistStatus(userLogin, documentId);

          htmlCard = `
                    <div class="col-md-4 col-12 mb-4">
                        <div class="card card-custom h-100">
                            <div class="card-img-top-custom">
                                ${
                                  element.document.endsWith(".pdf")
                                    ? '<i class="bi bi-file-earmark-pdf" style="font-size: 100px; color: red;"></i>'
                                    : element.document.endsWith(".webp") ||
                                      element.document.endsWith(".txt") ||
                                      element.document.endsWith(".docx") ||
                                      element.document.endsWith(".xlsx") ||
                                      element.document.endsWith(".pptx")
                                    ? '<i class="bi-file-earmark-text" style="font-size: 100px; color: red;"></i>'
                                    : `<img src="${element.document}" class="card-img-top card-img-custom">
                                    `
                                }
                            </div>
                            <div class="card-body">
                                <h5 class="card-title card-title-custom">${
                                  element.name
                                }</h5>
                                <p class="card-text">
                                    </p><small class="text-muted">Projekt: ${
                                      element.project
                                    }</p></small>
                                    <p><small class="text-muted">Hochgeladen von: ${
                                      element.user
                                    }</p></small>
                                    </p><small class="text-muted">Hochgeladen am: ${
                                      element.create
                                    }</p></small>
                                </p>
                                <i id="bookmarkId" data-documents-bookmark="${
                                  element.id
                                }" class="icon-font fa-solid fa-book-bookmark document-bookmark bookmarkDocumentId me-2"></i>
                                <a href="javascript:void(0);" data-documents-id="${
                                  element.id
                                }" class="btn btn-primary btn-sm mt-1 custome-documents me-2">Bearbeiten</a>
                                <a href="${
                                  element.document
                                }" class="btn btn-primary btn-sm mt-1" target="_blank">Dokument anzeigen</a>
                            </div>
                        </div>
                    </div>
                `;
          documentsRow.append(htmlCard);
        });
        documentCards.append(documentsRow);
        createPaginationLinks(data.page_count);
      },
      error: function (error) {
        console.error("Fehler beim Abrufen der Dokumente: " + error.statusText);
      },
    });
  }

  $("#selectTags").change(function () {
    filterDocumentsByTags();
  });
  $("#datepickerFrom").change(function () {
    var dateFrom = $(this).val();
    var dateTo = $("#datepickerTo").val();

    if (dateFrom && dateTo) {
      filterDocumentsByTags();
    }
  });

  $("#datepickerTo").change(function () {
    var dateFrom = $("#datepickerFrom").val();
    var dateTo = $(this).val();

    if (dateFrom && dateTo) {
      filterDocumentsByTags();
    }
  });

  $("#searchQuery").keyup(function () {
    var searchQuery = $(this).val();
    if (searchQuery.length >= 4) {
      filterDocumentsByTags(searchQuery);
    }
  });

  $("#selectUser").change(function () {
    filterDocumentsByTags();
  });

  function getUrlParameter(parameterName) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  }

  var meineDocumenteParameter = getUrlParameter("meine_documente");
  var projectIdParameter = getUrlParameter("project_id");

  if (meineDocumenteParameter === "true") {
    console.log('Parameter "meine_documente" ist wahr.');
    isUser = true;
    filterDocumentsByTags(isUser);
  }

  if (projectIdParameter) {
    console.log('Parameter "project_id" ist wahr.');
    var projectIdVal = projectIdParameter;
    filterDocumentsByTags(projectIdVal);
  } else {
    filterDocumentsByTags();
  }

  $("#userDocuments").on("click", function (event) {
    event.preventDefault();
    onlyWatchlist = false;
    isUser = true;
    filterDocumentsByTags(isUser);
  });

  $("#watchlistDocuments").on("click", function (event) {
    event.preventDefault();
    isUser = false;
    onlyWatchlist = true;
    filterDocumentsByTags(onlyWatchlist);
  });

  $("#allDocuments").on("click", function () {
    isUser = false;
    onlyWatchlist = false;
    filterDocumentsByTags(isUser, onlyWatchlist);
  });

  $("#resetDocumentsfilter").on("click", function () {
    setTimeout(function () {
      location.reload();
    }, 200);
  });

  $(
    "#selectTags, #datepickerFrom, #datepickerTo, #selectUser, #searchQuery"
  ).on("change", function () {
    $("#resetDocumentsfilter").removeClass("d-none");
  });

  function removeUrlParameters() {
    history.replaceState({}, document.title, window.location.pathname);
  }

  var resetButton = document.getElementById("allDocuments");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      removeUrlParameters();
    });
  }

  $(function () {
    $("#datepickerFrom").datepicker({
      dateFormat: "dd.mm.yy",
    });
    $("#datepickerTo").datepicker({
      dateFormat: "dd.mm.yy",
    });
  });

  function loadUser() {
    $.ajax({
      url: "/documents/user/select/",
      method: "GET",
      dataType: "json",
      success: function (data) {
        var select = $("#selectUser");
        select.empty();

        select.prepend(
          '<option value="" selected="selected">Hochgeladen von...</option>'
        );
        for (var i = 0; i < data.users.length; i++) {
          var users = data.users[i];
          select.append(
            '<option value="' + users.id + '">' + users.username + "</option>"
          );
        }
      },
      error: function () {
        console.error("Fehler beim Laden der Teams.");
      },
    });
  }
  loadUser();

  function loadTags() {
    $.ajax({
      url: "/documents/tags/select/",
      method: "GET",
      dataType: "json",
      success: function (data) {
        var select = $("#selectTags");
        select.empty();

        select.prepend(
          '<option value="" selected="selected">Tag auswählen...</option>'
        );

        for (var i = 0; i < data.tags.length; i++) {
          var tag = data.tags[i];
          select.append(
            '<option value="' + tag.id + '">' + tag.name + "</option>"
          );
        }
      },
      error: function () {
        console.error("Fehler beim Laden der Tags.");
      },
    });
  }
  loadTags();

  $("body").on("click", "#closeDocument", function () {
    $("#teamForm").val("");
    $("#teamHiddenId").val("");
    $("#tagFormDocumentDocument").val("");
    $("#tagHiddenId").val("");
    $("#projectNameForm").val("");
    $("#projectHiddenId").val("");
    $("#documentNameForm").val("");

    var myDropzone = Dropzone.forElement("#dropzoneDocument");
    myDropzone.removeAllFiles();

    $("#meinFormular").hide();

    location.reload();
  });

  function initializeDropzone() {
    var myDropzone = new Dropzone("#dropzoneDocument", {
      url: "/documents/create/",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      init: function () {
        var submitButton = document.querySelector("#saveButtonDocument");
        myDropzone = this;

        submitButton.addEventListener("click", function () {
          myDropzone.processQueue();
        });

        this.on("success", function (file, response) {
          var alertDocument = $("#alertDocument");
          alertDocument.append(`
                <div class="alert alert-success" role="alert">
                    Das Dokument wurde hochgeladen!
                </div>
                `);
          setTimeout(function () {
            $("#alertDocument").hide("");
          }, 5000);

          var urlParams = new URLSearchParams(window.location.search);
          var openModal = urlParams.get("documents_open_modal");
          if (openModal === "true") {
            urlParams.delete("documents_open_modal");
            var newUrl = window.location.pathname + "?" + urlParams.toString();
            window.history.replaceState({}, document.title, newUrl);
          }
        });

        this.on("sending", function (file, xhr, formData) {
          var documentNameForm = $("#documentNameForm").val();
          var loginUserId = $("#loginUserId").val();
          var teamHiddenId = $("#teamHiddenId").val();
          var tagHiddenId = $("#tagHiddenId").val();
          var projectHiddenId = $("#projectHiddenId").val();

          formData.append("csrfmiddleware token", csrftoken);
          formData.append("name", documentNameForm);
          formData.append("user", loginUserId);
          formData.append("team", teamHiddenId);
          formData.append("project", projectHiddenId);
          formData.append("tags", tagHiddenId);
        });
      },
      maxFiles: 5,
      maxFilesize: 4,
      addRemoveLinks: true,
      clickable: true,
      acceptedFiles:
        ".png, .jpg, .jpeg, .webp, .pdf, .txt, .docx, .xlsx, .pptx",
      autoProcessQueue: false,
    });
  }
  initializeDropzone();

  $("#teamForm").on("input", function () {
    var query = $(this).val();

    $.ajax({
      url: "/documents/autocomplete/team/",
      data: { q: query },
      success: function (data) {
        var results = data.results;

        var resultList = $("#teamResults");
        resultList.empty();
        var resultList = $("<ul>");

        $.each(results, function (index, item) {
          var listItem = $('<li class="team-item">')
            .attr("data-id", item.id)
            .text(item.name);

          resultList.append(listItem);
        });

        $("#teamResults").append(resultList);
      },
    });
  });

  $(document).on("click", ".team-item", function () {
    var teamId = $(this).data("id");
    var teamName = $(this).text();
    var resultList = $("#teamResults");
    var hideDelay = 300;

    $("#teamForm").val(teamName);
    $("#teamHiddenId").val(teamId);

    setTimeout(function () {
      resultList.empty();
    }, hideDelay);
  });

  $("#tagFormDocumentDocument").on("input", function () {
    var query = $(this).val();

    $.ajax({
      url: "/documents/autocomplete/tags/",
      data: { q: query },
      success: function (data) {
        var results = data.results;

        var resultList = $("#tagResults");
        resultList.empty();

        var resultList = $("<ul>");

        $.each(results, function (index, item) {
          var listItem = $('<li class="tags-item">')
            .attr("data-id", item.id)
            .text(item.name);
          resultList.append(listItem);
        });

        $("#tagResults").append(resultList);
      },
    });
  });

  $(document).on("click", ".tags-item", function () {
    var teamId = $(this).data("id");
    var teamName = $(this).text();
    var resultList = $("#tagResults");
    var hideDelay = 300;

    $("#tagFormDocumentDocument").val(teamName);
    $("#tagHiddenId").val(teamId);

    setTimeout(function () {
      resultList.empty();
    }, hideDelay);
  });

  $("#projectNameForm").on("input", function () {
    var query = $(this).val();

    $.ajax({
      url: "/documents/autocomplete/projets/",
      data: { q: query },
      success: function (data) {
        var results = data.results;
        var resultList = $("#projectResults");
        resultList.empty();
        var resultList = $("<ul>");

        $.each(results, function (index, item) {
          var listItem = $('<li class="project-item">')
            .attr("data-id", item.id)
            .text(item.name);
          resultList.append(listItem);
        });

        $("#projectResults").append(resultList);
      },
    });
  });

  $(document).on("click", ".project-item", function () {
    var teamId = $(this).data("id");
    var teamName = $(this).text();
    var resultList = $("#projectResults");
    var hideDelay = 300;

    $("#projectNameForm").val(teamName);
    $("#projectHiddenId").val(teamId);

    setTimeout(function () {
      resultList.empty();
    }, hideDelay);
  });
});
