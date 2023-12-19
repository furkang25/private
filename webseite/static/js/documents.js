$(document).ready(function () {

  var currentPage = 1;
  var isUser = false;
  var onlyWatchlist = false;

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
  const csrftoken = getCookie("csrftoken");
  
  // Entfernen eines URL Parameters und Neuladen der Seite
  function documentParameterRemove() {
    if (window.location.search.indexOf("documentOpenModal=true") !== -1) {
      var newUrl = window.location.href.replace("?documentOpenModal=true","");
      history.pushState({}, document.title, newUrl);
      location.reload();
    }
  }

  // Entfernung von URL-Parametern beim Klicken auf ein Element
  $("#closeDocument").click(function () {
    documentParameterRemove();
  });

  // Überprüfung des Beobachtungsliste von Dokumenten
  function documentsprojectsCheckWatchlistStatus(user_id, documentId) {
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
          '.bookmarkDocumentId[documentDataBookmark="' + documentId + '"]'
        );

        var isOnWatchlist = data.is_on_watchlist || false;

        if (isOnWatchlist) {
          iconElement.addClass("inWatchlist");
        } else {
          iconElement.removeClass("inWatchlist");
        }
      },
      error: function () {

      },
    });
  }

  // Automatisches Öffnen eines Modal-Fensters
  function openModalIfParameterExists() {
    var urlParams = new URLSearchParams(window.location.search);
    var openModal = urlParams.get("documentOpenModal");

    if (openModal === "true") {
      $("#uploadDocument").modal("show");
    }
  }
  openModalIfParameterExists();

  // Beobachtungsliste eines Dokuments zu ändern und zu überprüfen
  $("#documentCards").on("click", ".documentBookmark", function () {
    var document_id = $(this).attr("documentDataBookmark");
    var user_id = $("#loginUserId").val();

    $.ajax({
      url: "/documents/toggle-watchlist/",
      method: "POST",
      data: { user_id: user_id, document_id: document_id },
      headers: {
        "X-CSRFToken": csrftoken,
      },
      success: function (data) {
        documentsprojectsCheckWatchlistStatus(user_id, document_id);
      },
      error: function () {
        console.log("Fehler beim Ändern der Beobachtungsliste.");
      },
    });
  });

  // Dokument zu löschen und Seite neu laden
  $("body").on("click", ".document-delete-btn", function () {
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
        console.error("Fehler bei Löschen eines Dokuments.");
      },
    });
  });

  // Bearbeitung von Dokument Informationen zu öffnen und die entsprechenden Daten zu laden
  $("#documentCards").on("click", ".documentEdit", function () {
    var dataDocuments = $(this).attr("documentDataId");

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
        $("#DocumentTagForm").val(data.documents.tags_name);
        $("#documentNameForm").val(data.documents.name);
        $("#documentesDelete").attr("data-documents-delete-id",data.documents.id);
      },
      error: function () {
        console.error("Fehler beim Laden von Dokument Informationen.");
      },
    });
  });

  // Informationen eines Dokument an den Server zu senden und Seite neu zu laden
  $("#updateButtonDocument").on("click", function () {
    var projectHiddenId = $("#projectHiddenId").val();
    var tagHiddenId = $("#tagHiddenId").val();
    var toAssignHiddenId = $("#toAssignHiddenId").val();
    var documentNameForm = $("#documentNameForm").val();
    var dataDocuments = $("#documentHiddenId").val();

    var updatedData = {
      name: documentNameForm,
      tags: tagHiddenId,
      project: projectHiddenId,
      toAssign: toAssignHiddenId,
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
        console.error("Fehler beim Dokument senden.");
      },
    });
  });

  // Dropdown Menü nach Änderung versteckten Formularfelder zurückgesetzt
  $("#toAssign").on("change", function () {
    $("#toAssignHiddenId").val("");
  });

  $("#projectNameForm").on("change", function () {
    $("#projectHiddenId").val("");
  });

  $("#DocumentTagForm").on("change", function () {
    $("#tagHiddenId").val("");
  });

  // Dokumente bestimmten Tags zu filtern
  $(document).ready(function () {
    DocumentFilterByTags(currentPage);
  });

  // Dokumentenliste ausgewählten Seitennummer neu zu filtern
  $(document).on("click", ".paginationLink", function () {
    var page = parseInt($(this).data("page"));
    DocumentFilterByTags(page);
  });

  // Navigation durch mehrseitige Dokumentenlisten
  function createPaginationLinks(pageCount) {
    var paginationContainer = $("#paginationContainer");
    paginationContainer.empty();

    var previousPageLink = $(
      '<li class="page-item"><a class="page-link" href="javascript:void(0);" data-page="1">Previous</a></li>'
    );
    paginationContainer.append(previousPageLink);

    for (var i = 1; i <= pageCount; i++) {
      var pageLink = $(
        '<li class="page-item"><a class="page-link paginationLink" href="javascript:void(0);" data-page="' +
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

  // Präferenzen zu filtern und Dokumente anzuzeigen
  function DocumentFilterByTags(page) {
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
        selecte_user: dataToSend.selecteUser,
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
          documentsprojectsCheckWatchlistStatus(userLogin, documentId);

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
                                <i id="bookmarkId" documentDataBookmark="${
                                  element.id
                                }" class="icon-font fa-solid fa-book-bookmark documentBookmark bookmarkDocumentId me-2"></i>
                                <a href="javascript:void(0);" documentDataId="${
                                  element.id
                                }" class="btn btn-primary btn-sm mt-1 documentEdit me-2">Bearbeiten</a>
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
        console.error("Fehler beim Abrufen eines Dokument Karte");
      },
    });
  }

  // Dokumentenfilterung bei Änderung der Tag-Auswahl
  $("#selectTags").change(function () {
    DocumentFilterByTags();
  });

  // Dokumentenfilterung bei Änderung des Startdatums
  $("#datepickerFrom").change(function () {
    var dateFrom = $(this).val();
    var dateTo = $("#datepickerTo").val();

    if (dateFrom && dateTo) {
      DocumentFilterByTags();
    }
  });

  // Dokumentenfilterung bei Änderung des Endedatums
  $("#datepickerTo").change(function () {
    var dateFrom = $("#datepickerFrom").val();
    var dateTo = $(this).val();

    if (dateFrom && dateTo) {
      DocumentFilterByTags();
    }
  });

  // Eingegebenen Suchbegriff zu filtern
  $("#searchQuery").keyup(function () {
    var searchQuery = $(this).val();
    if (searchQuery.length >= 4) {
      DocumentFilterByTags(searchQuery);
    }
  });

  // Dokumentenfilterung bei Änderung der Benutzerauswahl
  $("#selectUser").change(function () {
    DocumentFilterByTags();
  });

  // Abrufen von URL Parametern
  function getUrlParameter(parameterName) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
  }

  var myDocumenteParameter = getUrlParameter("myDocumente");
  var projectIdParameter = getUrlParameter("project_id");

  // Überprüfen und Aktivieren von Benutzerfiltern
  if (myDocumenteParameter === "true") {
    isUser = true;
    DocumentFilterByTags(isUser);
  }

  // Überprüft von project_id existiert
  if (projectIdParameter) {
    var projectIdVal = projectIdParameter;
    DocumentFilterByTags(projectIdVal);
  } else {
    DocumentFilterByTags();
  }

  // Aktivieren der Benutzerdokumentenansicht
  $("#userDocuments").on("click", function (event) {
    event.preventDefault();
    onlyWatchlist = false;
    isUser = true;
    DocumentFilterByTags(isUser);
  });

  // Aktivieren der Beobachtungsliste Dokumentenansicht
  $("#watchlistDocument").on("click", function (event) {
    event.preventDefault();
    isUser = false;
    onlyWatchlist = true;
    DocumentFilterByTags(onlyWatchlist);
  });

  // Aktivieren der gesamten Dokumentenansicht
  $("#allDocuments").on("click", function () {
    isUser = false;
    onlyWatchlist = false;
    DocumentFilterByTags(isUser, onlyWatchlist);
  });

  // Zurücksetzen der Dokumentenfilter
  $("#DocumentResetFilter").on("click", function () {
    setTimeout(function () {
      location.reload();
    }, 200);
  });

  // Anzeigen des Zurücksetzen Button bei Filteränderungen
  $("#selectTags, #datepickerFrom, #datepickerTo, #selectUser, #searchQuery").on("change", function () {
    $("#DocumentResetFilter").removeClass("d-none");
  });

  // Entfernen von URL Parametern
  function removeUrlParameters() {
    history.replaceState({}, document.title, window.location.pathname);
  }

  // Entfernen von URL Parametern durch Klicken auf den Zurücksetzen Button
  var resetButton = document.getElementById("allDocuments");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      removeUrlParameters();
    });
  }

  // Datumseingabefeldern 
  $(function () {
    $("#datepickerFrom").datepicker({
      dateFormat: "dd.mm.yy",
    });
    $("#datepickerTo").datepicker({
      dateFormat: "dd.mm.yy",
    });
  });

  // Laden von Benutzeroptionen für Dropdown Listen
  function userOptions() {
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
        console.error("Fehler beim  Laden von Benutzeroptionen.");
      },
    });
  }
  userOptions();

  // Laden von Tag Optionen für Dropdown Listen
  function tagOptions() {
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
        console.error("Fehler beim Laden von Tag Optionen.");
      },
    });
  }
  tagOptions();

  // Formularfelder und Eingabebereiche zurückgesetzt und Seite Neuladen
  $("body").on("click", "#closeDocument", function () {
    $("#toAssign").val("");
    $("#toAssignHiddenId").val("");
    $("#DocumentTagForm").val("");
    $("#tagHiddenId").val("");
    $("#projectNameForm").val("");
    $("#projectHiddenId").val("");
    $("#documentNameForm").val("");

    var myDropzone = Dropzone.forElement("#dropzoneDocument");
    myDropzone.removeAllFiles();

    $("#myFormular").hide();

    location.reload();
  });

  // Dropzone für Dateiupload
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
          var openModal = urlParams.get("documentOpenModal");
          if (openModal === "true") {
            urlParams.delete("documentOpenModal");
            var newUrl = window.location.pathname + "?" + urlParams.toString();
            window.history.replaceState({}, document.title, newUrl);
          }
        });

        this.on("sending", function (file, xhr, formData) {
          var documentNameForm = $("#documentNameForm").val();
          var loginUserId = $("#loginUserId").val();
          var toAssignHiddenId = $("#toAssignHiddenId").val();
          var tagHiddenId = $("#tagHiddenId").val();
          var projectHiddenId = $("#projectHiddenId").val();

          formData.append("csrfmiddleware token", csrftoken);
          formData.append("name", documentNameForm);
          formData.append("user", loginUserId);
          formData.append("toAssign", toAssignHiddenId);
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

  // Autovervollständigung für Zugewiesen in einer Suchleiste
  $("#toAssign").on("input", function () {
    var query = $(this).val();

    $.ajax({
      url: "/documents/autocomplete/toAssign/",
      data: { q: query },
      success: function (data) {
        var results = data.results;

        var resultList = $("#toAssignResults");
        resultList.empty();
        var resultList = $("<ul>");

        $.each(results, function (item) {
          var listItem = $('<li class="toAssign-item">')
            .attr("data-id", item.id)
            .text(item.name);

          resultList.append(listItem);
        });

        $("#toAssignResults").append(resultList);
      },
    });
  });

  // Auswahl eines Zugewiese aus den Autovervollständigungsergebnissen
  $(document).on("click", ".toAssign-item", function () {
    var toAssignId = $(this).data("id");
    var toAssignName = $(this).text();
    var resultList = $("#toAssignResults");
    var hideDelay = 300;

    $("#toAssign").val(toAssignName);
    $("#toAssignHiddenId").val(toAssignId);

    setTimeout(function () {
      resultList.empty();
    }, hideDelay);
  });

  // Autovervollständigung für Tag in einer Suchleiste
  $("#DocumentTagForm").on("input", function () {
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
          var listItem = $('<li class="tag-item">')
            .attr("data-id", item.id)
            .text(item.name);
          resultList.append(listItem);
        });

        $("#tagResults").append(resultList);
      },
    });
  });

  // Auswahl eines Tags aus den Autovervollständigungsergebnissen
  $(document).on("click", ".tag-item", function () {
    var toAssignId = $(this).data("id");
    var toAssignName = $(this).text();
    var resultList = $("#tagResults");
    var hideDelay = 300;

    $("#DocumentTagForm").val(toAssignName);
    $("#tagHiddenId").val(toAssignId);

    setTimeout(function () {
      resultList.empty();
    }, hideDelay);
  });

  // Autovervollständigung für projectName in einer Suchleiste
  $("#projectNameForm").on("input", function () {
    var query = $(this).val();

    $.ajax({
      url: "/documents/autocomplete/project/",
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

  // Auswahl eines projectName aus den Autovervollständigungsergebnissen
  $(document).on("click", ".project-item", function () {
    var toAssignId = $(this).data("id");
    var toAssignName = $(this).text();
    var resultList = $("#projectResults");
    var hideDelay = 300;

    $("#projectNameForm").val(toAssignName);
    $("#projectHiddenId").val(toAssignId);

    setTimeout(function () {
      resultList.empty();
    }, hideDelay);
  });
});
