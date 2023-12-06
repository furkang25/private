// Warten bis das Dokument vollständig geladen ist
$(document).ready(function () {

  //Parameter enziehen bei Projekt
  function projectParameterRemove(){
      // Überprüfen, ob der Parameter vorhanden ist
      if (window.location.search.indexOf('projekt_open_modal=true') !== -1) {
        // Entfernen Sie den Parameter aus der URL
        var newUrl = window.location.href.replace('?projekt_open_modal=true', '');

        // Verwenden Sie history.pushState, um die URL zu ändern
        history.pushState({}, document.title, newUrl);

        // Aktualisieren Sie die Seite
        location.reload();
    }
  }

  var myDropzone;
  
  Dropzone.options.dropzone = {
    init: function () {
      myDropzone = this; // Speichern Sie die Dropzone-Instanz in der Variable
    }
  }

  //Parameter enziehen bei Projekt funktions auslöser
  $('#closProjekt').click(function () {
    projectParameterRemove();
    if (myDropzone) {
      // Deaktivieren Sie die Dropzone und entfernen Sie alle Dateien
      myDropzone.disable();
      myDropzone.removeAllFiles();
    }
  });


  // Funktion zur Abfrage eines Cookies mit einem bestimmten Namen
  const getCookie = (name) => {
    // Initialisiere cookieValue mit null
    let cookieValue = null;

    // Überprüfe, ob Cookies überhaupt vorhanden sind
    if (document.cookie && document.cookie !== "") {
      // Zerlege den Cookie-String in ein Array
      const cookies = document.cookie.split(";");

      // Durchlaufe alle Cookies
      for (let i = 0; i < cookies.length; i++) {
        // Entferne eventuelle Leerzeichen am Anfang und am Ende des Cookie-Strings
        const cookie = cookies[i].trim();

        // Überprüfe, ob der Cookie-String mit dem gesuchten Namen beginnt
        if (cookie.substring(0, name.length + 1) === name + "=") {
          // Extrahiere den Wert des Cookies und dekodiere ihn
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          // Breche die Schleife ab, da der gesuchte Cookie gefunden wurde
          break;
        }
      }
    }
    // Gib den Wert des gesuchten Cookies zurück (oder null, falls nicht gefunden)
    return cookieValue;
  };
  // Hole den CSRF-Token aus dem Cookie 'csrftoken'
  const csrftoken = getCookie("csrftoken");
  // csrftoken wird nun für AJAX-Anfragen verwendet, um Sicherheitsrisiken zu minimieren

  function openModalIfParameterExists() {
    // Holen des URL-Parameters
    var urlParams = new URLSearchParams(window.location.search);
    var openModal = urlParams.get("projekt_open_modal");
    if (openModal === "true") {
      $("#exampleModalToggle").modal("show");
      performAjaxSearch();
    }
  }

  openModalIfParameterExists();

  // Funktion zum Löschen eines Projekts
  function deleteProject(projectId) {
    // Elemente für die Anzeige von Projektinformationen im HTML-Dokument auswählen
    var creatorProjektView = $("#creatorProjektView");
    var viewNameProject = $("#viewNameProject");
    var viewTeamProject = $("#viewTeamProject");
    var viewDescriptionProject = $("#viewDescriptionProject");

    // AJAX-Anfrage, um das Projekt zu löschen
    $.ajax({
      url: `/project/delete/${projectId}/`, // URL für die Löschaktion
      method: "POST", // HTTP-Methode
      dataType: "json", // Datenformat
      headers: {
        "X-CSRFToken": csrftoken, // CSRF-Token für Sicherheit
      },
      success: function (data) {
        // Bei Erfolg prüfe die Rückmeldung und aktualisiere die Ansicht
        if (data.message === "Projekt erfolgreich gelöscht.") {
          $("#exampleDelete").modal("hide"); // Schließe das Modal-Fenster
          updateProjectList(); // Aktualisiere die Projektliste

          // Leere die Projektinformationen in der Ansicht
          creatorProjektView.text("");
          viewDescriptionProject.text("");
          viewNameProject.text("");
          viewTeamProject.text("");
        } else {
          // Bei Fehlschlag, logge den Fehler
          console.error("Fehler beim Löschen des Projekts.");
        }
      },
      error: function () {
        // Bei einem Fehler bei der AJAX-Anfrage, logge den Fehler
        console.error("Fehler bei der Ajax-Anfrage.");
      },
    });
  }

  // Beispielaufruf zum Löschen eines Projekts
  $("#delete-button").on("click", function () {
    // Hole die Projekt-ID aus dem Input-Feld mit der ID 'proectDeleteID'
    var project_id = $("#proectDeleteID").val();
    console.log(project_id)
    // Rufe die Funktion deleteProject mit der Projekt-ID als Argument auf
    deleteProject(project_id);
  });

  // Öffne ein Modal zum Bestätigen des Löschvorgangs, wenn der Button mit der ID 'trashDelete' angeklickt wird
  $("#trashDelete").on("click", function () {
    // Hole die Projekt-ID aus dem Attribut 'data-projekt-id' des Elements mit der ID 'updateProjekt'
    var project_id = $("#updateProjekt").attr("data-projekt-id");

    // AJAX-Anfrage, um Informationen zum zu löschenden Projekt zu holen
    $.ajax({
      url: `/project/delete/${project_id}/`, // URL zum Abrufen von Informationen vor dem Löschen
      method: "GET", // HTTP-Methode
      dataType: "json", // Datenformat
      success: function (data) {
        // Prüfe, ob der Projektname in der Antwort vorhanden ist
        if (data.project_name) {
          // Setze die Projekt-ID im Input-Feld 'proectDeleteID'
          $("#proectDeleteID").val(data.project_id);
          // Setze den Text im Modal-Fenster zum Bestätigen des Löschens
          $("#textDelate").text(
            'Projekt "' + data.project_name + '" löschen bestätigen'
          );
          // Zeige das Modal-Fenster an
          $("#exampleDelete").modal("show");
        } else {
          // Logge einen Fehler, wenn der Projektname nicht abgerufen werden konnte
          console.error("Projektnamen konnte nicht abgerufen werden.");
        }
      },
      error: function () {
        // Logge einen Fehler bei der AJAX-Anfrage
        console.error("Fehler bei der Ajax-Anfrage.");
      },
    });
  });

  // Event-Handler für den Button mit der ID 'updateProjekt'
  $("#updateProjekt").on("click", function () {
    // Schalte den "Submit"-Button im Modal aus und den "Update"-Button ein
    $("#submit-button").addClass("d-none");
    $("#update-button").removeClass("d-none");
    // Zeige das Modal-Fenster an
    $("#exampleModalToggle").modal("show");

    // Hole die Projekt-ID aus dem Attribut 'data-projekt-id'
    var project_id = $(this).attr("data-projekt-id");

    // AJAX-Anfrage, um Details des Projekts zu holen
    $.ajax({
      url: "/project/project-detail/" + project_id + "/",
      method: "GET",
      success: function (data) {
        //Setze die Felder im Modal-Fenster mit den abgerufenen Daten
        $("#projektname").val(data.name);
        $("#description").val(data.description);

        // Hier kommen die User an
        var projectUsers = data.project_users;

        // Das Dropdown-Element auswählen
        var selectField = $("#multiple-select-field");

        var select2Options = [];

        for (var username in projectUsers) {
          if (projectUsers.hasOwnProperty(username)) {
            console.log("Benutzername:", username, "Wert:", projectUsers[username]);
        
            // Erstellen Sie ein Objekt für die Select2-Option
            var option = {
              id: username,    // Eindeutige ID für die Option
              text: username   // Anzeigetext der Option
            };
        
            // Überprüfen Sie, ob der Benutzer dem Projekt zugewiesen ist und setzen Sie selected auf true, falls zutreffend
            if (projectUsers[username]) {
              option.selected = true;
            }
        
            // Fügen Sie die Option zum Array der Select2-Optionen hinzu
            select2Options.push(option);
          }
        }
        
        // Verwenden Sie das Select2-Plugin, um das Dropdown-Feld zu initialisieren
        selectField.select2({
          theme: "bootstrap-5",
          width: selectField.data('width') ? selectField.data('width') : selectField.hasClass('w-100') ? '100%' : 'style',
          placeholder: selectField.data('placeholder'),
          data: select2Options // Verwenden Sie das Array der Select2-Optionen
        });

      },
      error: function () {
        // Logge Fehlermeldung bei Fehlschlag
        console.log("Fehler beim Abrufen der Projektinformationen.");
      },
    });
  });

  // Event-Handler für den Button mit der ID 'update-button'
  $("#update-button").on("click", function () {
    // Hole die notwendigen Daten aus dem Modal-Fenster
    var project_id = $("#updateProjekt").attr("data-projekt-id");
    var projektName = $("#projektname").val();
    var teamId = $("#team_id").val();
    var description = $("#description").val();

    var selectedUsers = $("#multiple-select-field").val();

    // Erstelle ein Objekt mit den aktualisierten Daten
    var updatedData = {
      name: projektName,
      selected_users: selectedUsers,
      description: description,
    };

    // AJAX-Anfrage, um das Projekt zu aktualisieren
    $.ajax({
      url: `/project/update/${project_id}/`, // URL für die Aktualisierung des Projekts
      method: "POST", // HTTP-Methode
      data: updatedData, // Aktualisierte Daten
      dataType: "json", // Datenformat
      headers: {
        "X-CSRFToken": csrftoken, // CSRF-Token für Sicherheit
      },
      success: function (data) {
        // Prüfe, ob eine Nachricht in der Antwort vorhanden ist
        if (data.message) {
          // Aktualisiere die Projektliste und verstecke das Modal-Fenster
          updateProjectList();
          deatileViewProjekt(project_id);
          $("#exampleModalToggle").modal("hide");
        } else {
          // Logge Fehlermeldung, wenn die Aktualisierung nicht erfolgreich war
          console.error('Fehler bei der Aktualisierung des Projekts.');
        }
      },
      error: function () {
        // Logge Fehlermeldung bei einer fehlgeschlagenen AJAX-Anfrage
        console.error("Fehler bei der Ajax-Anfrage.");
      },
    });
  });

  // Funktion zur Überprüfung des Watchlist-Status eines Projekts für einen bestimmten Benutzer
  function checkWatchlistStatus(user, project) {
    var user_id = user; // Benutzer-ID
    var project_id = project; // Projekt-ID

    // AJAX-Anfrage an den Server, um den Watchlist-Status zu überprüfen
    $.ajax({
      url:
        "/project/check-watchlist-status/" + user_id + "/" + project_id + "/",
      type: "GET",
      dataType: "json",
      headers: {
        "X-CSRFToken": csrftoken, // CSRF-Token für Sicherheit
      },
      success: function (data) {
        var iconElement = document.getElementById("bookmarkId");
        // Färbe oder entfärbe das Icon je nach Watchlist-Status
        if (data.is_on_watchlist) {
          iconElement.classList.add("watchlisted"); // Färbe das Icon ein
        } else {
          iconElement.classList.remove("watchlisted"); // Entfärbe das Icon
        }
      },
      error: function (error) {
        // Fehlerbehandlung
        // console.log(error);
      },
    });
  }

  // Funktion zur Hinzufügung oder Entfernung eines Projekts von der Watchlist
  $("#bookmarkForm").on("click", ".project", function () {
    var project_id = $(this).attr("data-project-bookmark"); // Hole die Projekt-ID
    var user_id = $("#userId").val(); // Hole die Benutzer-ID

    // AJAX-Anfrage an den Server, um den Watchlist-Status zu ändern
    $.ajax({
      url: "/project/toggle-watchlist/",
      method: "POST",
      data: { user_id: user_id, project_id: project_id }, // Daten für die Anfrage
      headers: {
        "X-CSRFToken": csrftoken, // CSRF-Token für Sicherheit
      },
      success: function (data) {
        // Verarbeite die erfolgreiche Antwort
        checkWatchlistStatus(user_id, project_id); // Aktualisiere den Watchlist-Status
        if (data.action === "add") {
          // Aktion für das Hinzufügen
          // Hier könnten weitere Aktionen folgen
        } else if (data.action === "remove") {
          // Aktion für das Entfernen
          // Hier könnten weitere Aktionen folgen
        }
      
        // Aktualisieren der Seite
        location.reload();
      },
      error: function () {
        // Verarbeite eine fehlerhafte Antwort
        console.log("Fehler beim Ändern der Watchlist.");
      },
    });
  });

  // Funktion für die Anzeige der Projektdetails
  function deatileViewProjekt(project_id) {
    // Entferne die "active"-Klasse von allen Projekt-Elementen
    $("[data-projekt]").removeClass("active");

    // Initialisiere DOM-Elemente
    var creatorProjektView = $("#creatorProjektView");
    var viewNameProject = $("#viewNameProject");
    var viewDescriptionProject = $("#viewDescriptionProject");
    var DocumentsButton = $("#DocumentsButton");

    // Setze das aktuelle Projekt für die Bookmark-Funktion
    $(".project").attr("data-project-bookmark", project_id);

    // Ändere die Anzeigeoptionen
    $(".myHideClass").removeClass("d-none");
    $(".myViewClass").addClass("d-none");

    // Speichere die Projekt-ID für spätere Verwendung
    $("#updateProjekt").attr("data-projekt-id", project_id);

    // AJAX-Anfrage, um die Projektdetails abzurufen
    $.ajax({
      url: "/project/project-detail/" + project_id + "/",
      method: "GET",
      success: function (data) {
        // Leere den Kommentarbereich
        $("#commentsContainer").empty();

        // Markiere das aktuelle Projekt als aktiv
        var elementToActivate = $('[data-projekt="' + project_id + '"]');
        elementToActivate.addClass("active");
        
        // Füge Kommentare hinzu
        data.comments.forEach(function (document) {
          // Erstelle das HTML für die Kommentare
          var htmlComments = `
                <div class="col-12 mt-5">
                    <figure>
                    <figcaption class="blockquote-footer">
                        <cite title="Source Title" class="user-name">
                        ${document.user} ${ document.can_edit ? `<i data-comment-id="${document.id}" class="update-comment-data fa-regular fa-pen-to-square"></i> <i data-comment-id="${document.id}" class="comment-delete-data fa-solid fa-trash"></i>` : ""} 
                        </cite>
                    </figcaption>
                    </figure>
                    <small class="commentText">${document.text}</small><br>
                    <small>${document.date}</small>
                    <hr>
                </div>
                `;
          $("#commentsContainer").append(htmlComments);
        });

        // Überprüfe, ob der Benutzer dieses Projekt in seiner Watchlist hat
        var userLogin = $("#userId").val();
        checkWatchlistStatus(userLogin, project_id);

        // Zeige Projektinformationen an
        creatorProjektView.text(data.username);
        viewDescriptionProject.text(data.description);
        viewNameProject.text(data.name);

        console.log(data.can_edit)

        // Entscheide, welche Bearbeitungsoptionen angezeigt werden sollen
        if (data.can_edit) {
          $("#updateProjekt").removeClass("d-none");
          $("#crateComment").removeClass("d-none");
        }else{
          $("#trashDelete").addClass("d-none");
          $("#updateProjekt").addClass("d-none");
        }

        // Superadmin kann alles bearbeiten und Löschen
        if(data.can_delete){
          $("#crateComment").removeClass("d-none");
          $("#trashDelete").removeClass("d-none");
          $("#updateProjekt").removeClass("d-none");
        }

        // Zeige den Teamnamen oder eine Ersatzmeldung an
        // *** Team wurde gelsöcht ***
        var count = 0;
        $("#multiple-select-field").empty();
        $("#viewTeamProject").empty();
        for (var username in data.project_users) {
          if (data.project_users.hasOwnProperty(username) && data.project_users[username] === true) {
            // Erstellen ein HTML-Element für den Benutzer und fügen Sie es dem Element hinzu
            count++; // Zählvariable erhöhen

            // Überprüfen, ob es sich um das zweite Element (count gleich 2) handelt
            if (count > 1) {
              // Fügen Sie die Klasse mx-1 hinzu
              var htmlUser = `<div class="mx-1">,${username}</div>`;
            } else {
              // Andernfalls fügen das HTML-Element ohne die Klasse hinzu
              var htmlUser = `<div>${username}</div>`;
            }
            $(htmlUser).appendTo("#viewTeamProject");
          }
        }

        // Zeige den Dokumentenbutton an, wenn Dokumente vorhanden sind
        if (data.documents && data.documents.length > 0) {
          DocumentsButton.html(
            '<a href="/documents/?projekt_id=' +
              project_id +
              '" type="button" class="btn btn-primary">Zu den Dokumenten</a>'
          );
        } else {
          DocumentsButton.html("");
        }
      },
      error: function () {
        // Fehlerbehandlung
        console.log("Fehler beim Abrufen der Projektinformationen.");
      },
    });
  }

  // Event Listener für die Liste der Projekte
  $("#projectList").on("click", ".list-view", function () {
    // Hole die Projekt-ID vom geklickten Element
    var project_id = $(this).attr("data-projekt");
    // Rufe die Funktion für die Detailansicht des Projekts auf
    deatileViewProjekt(project_id);
  });

  // Standard-Liste beim Laden der Seite anzeigen
  

  // Projekt list View
  function updateProjectList( searchQuery = "", userProjects = false, watchlistProjects = false, assignedProjects = false) {
    $.ajax({
      url: "/project/project-list/",
      method: "GET",
      data: {
        search: searchQuery,
        user_projects: userProjects ? "true" : "false",
        show_watchlist: watchlistProjects ? "true" : "false",
        assigned_projects: assignedProjects ? "true" : "false",
      },
      success: function (data) {
        // Erfolgreiche Antwort verarbeiten

        var projects = data.projects;

        var projectList = $("#projectList");
        projectList.empty(); // Leeren Sie die Projektliste zuerst

        if (watchlistProjects) {
          // Anzeige der Watchlist-Projekte
          $.each(projects, function (index, project) {
            if (project.is_on_watchlist) {
              var projectListHtml = `
                            <a href="javascript:void(0);" data-projekt="${project.id}" class="list-group-item list-view list-group-item-action py-3 lh-tight">
                                <div class="d-flex w-100 align-items-center justify-content-between">
                                    <strong class="mb-1">${project.name}</strong>
                                    <span class="bookmark-icon2">&#9733;</span> <!-- Stern-Symbol -->
                                </div>
                                <div class="col-10 mb-1 small">${project.create}</div>
                            </a>
                            `;
              projectList.append(projectListHtml);
            }
          });
        } else {
          // Anzeige aller anderen Projekte
          $.each(projects, function (index, project) {
              var extraClass = project.is_on_watchlist ? 'marked' : '';
              var bookmarkStyle = project.is_on_watchlist ? 'style="color:red;"' : ''; // Rote Farbe, wenn auf der Watchlist
              var projectListHtml = `
              <a href="javascript:void(0);" data-projekt="${project.id}" class="list-group-item list-view list-group-item-action py-3 lh-tight ${extraClass}">
                  <div class="d-flex w-100 align-items-center justify-content-between">
                      <strong class="mb-1">${project.name}</strong>
                      <span class="bookmark-icon" ${bookmarkStyle}>&#9733;</span> <!-- Stern-Symbol mit optionalem roten Stil -->
                  </div>
                  <div class="col-10 mb-1 small">${project.user}  ${project.create}</div>
              </a>
              `;
              projectList.append(projectListHtml);
          });
        }
      },
      error: function () {
        // Fehlerhafte Antwort verarbeiten
        console.log("Fehler beim Abrufen der Projektliste.");
      },
    });
  }

  // Event für das Suchfeld
  $("#exampleFormControlInput1").on("input", function () {
    // Hole den aktuellen Wert des Suchfelds
    var searchQuery = $(this).val();
    // Aktualisiere die Projektliste basierend auf dem Suchbegriff
    updateProjectList(searchQuery);
  });

  // Funktion, um einen URL-Parameter abzurufen
  function getUrlParameter(parameterName) {
    // Hole alle URL-Parameter
    var urlParams = new URLSearchParams(window.location.search);
    // Gebe den Wert des gesuchten Parameters zurück
    return urlParams.get(parameterName);
  }

  var meineProjekteParameter = getUrlParameter("meine_projekte");
  if (meineProjekteParameter === "true") {
    var searchQuery = $("#exampleFormControlInput1").val();
    updateProjectList(searchQuery, true, false, false);
  }else{
    updateProjectList();
  }


  // Event für den Button "Benutzerprojekte"
  $(".nav-link-user-projects").on("click", function () {
    // Hole den aktuellen Suchbegriff
    var searchQuery = $("#exampleFormControlInput1").val();
    // Aktualisiere die Projektliste, zeige nur Projekte des Benutzers an
    updateProjectList(searchQuery, true);
  });

  // Event für den Button "Watchlist-Projekte"
  $(".nav-link-watchlist-projects").on("click", function () {
    // Hole den aktuellen Suchbegriff
    var searchQuery = $("#exampleFormControlInput1").val();
    // Aktualisiere die Projektliste, zeige nur Watchlist-Projekte an
    updateProjectList(searchQuery, false, true);
  });

  // Mir zugewiesen Projekte
  $('#assignedProjects').on('click', function (){
    updateProjectList(searchQuery, false, false, true);
  });

  // Event für den Button "Filter zurücksetzen"
  $("#resetFiltersButton").on("click", function () {
    // Setze alle Filter zurück und aktualisiere die Projektliste
    updateProjectList();
    // Leere das Suchfeld
    $("#exampleFormControlInput1").val("");
  });

  // Funktion zum Zurücksetzen des URL-Parameters "meine_projekte"
  function resetMeineProjekteParameter() {
    // Erzeuge ein URL-Objekt aus der aktuellen URL
    var url = new URL(window.location.href);
    // Entferne den Parameter "meine_projekte"
    url.searchParams.delete("meine_projekte");

    // Lade die Seite neu ohne den Parameter
    window.location.href = url.toString();
  }

  // Füge einen Event Listener zum Button "Filter zurücksetzen" hinzu
  document
    .getElementById("resetFiltersButton")
    .addEventListener("click", function () {
      // Rufe die Funktion zum Zurücksetzen des Parameters auf
      resetMeineProjekteParameter();
    });



  // Event für den "Schließen"-Button eines Projekts
  $("#closProjekt").on("click", function () {
    // Setze alle Eingabefelder zurück
    $("#projektname").val("");
    $("#team").val("");
    $("#description").val("");
    // Hole die Dropzone-Instanz und entferne alle Dateien
    var myDropzone = Dropzone.forElement("#dropzone");
    myDropzone.removeAllFiles();
    // Ändere die Sichtbarkeit von Elementen
    $("#dropzone").addClass("d-none");
    $("#submit-button").removeClass("d-none");

    // Aktualisieren der Seite
    location.reload();
  });

  // Event für den "Projekt speichern"-Button
  var projectId;
  $("#submit-button").on("click", function (e) {
    e.preventDefault(); // Verhindere den Standard-Submit des Formulars

    if (!validateForm()) {
      return;
    }

    // Sammle die Daten aus den Eingabefeldern
    var user_id = $("#user_id").val();
    var projektname = $("#projektname").val();
    var selectedUsers = $("#multiple-select-field").val();
    var description = $("#description").val();

    // Überprüfe, ob die erforderlichen Felder ausgefüllt sind
    if (!validateForm()) {
      return;
    }


    // AJAX-Anfrage, um das Projekt zu erstellen
    $.ajax({
      url: "/project/create-project/",
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken, // CSRF-Token für Sicherheit
      },
      data: {
        user_id: user_id,
        projektname: projektname,
        selected_users: selectedUsers,
        description: description,
      },
      success: function (data) {
        // Erfolgreiche Erstellung des Projekts
        projectId = data.project_id; // Speichere die Projekt-ID

        // Ändere die Sichtbarkeit von Elementen
        $("#dropzone").removeClass("d-none");
        $(".tags-form").removeClass("d-none");
        $("#submit-button").addClass("d-none");

        // Initialisiere Dropzone (Datei-Upload-Bereich)
        initializeDropzone();

        // Zeige eine Erfolgsmeldung
        var alertProject = $("#alertProjekt");
        alertProject.append(`
                <div class="alert alert-success" role="alert">
                    Das Projekt wurde angelegt!
                </div>
                `);

        // Entferne die Erfolgsmeldung nach einer Sekunde
        setTimeout(function () {
          $("#alertProjekt").hide("");
        }, 5000);
      },
      error: function (data) {
        // Behandle den Fehler und logge ihn
        console.log(data.error);
      },
    });
  });


  // Initialisierung der Dropzone für Datei-Uploads
  function initializeDropzone() {
    Dropzone.autoDiscover = false;
    const myDropzone = new Dropzone("#dropzone", {
      url: "/project/upload-files/", // URL, wohin die Dateien hochgeladen werden
      init: function () {
        this.on("success", function (file, response) {
          // Wenn der Upload erfolgreich ist
          updateProjectList(); // Aktualisiere die Projektliste

          // Überprüfe, ob ein URL-Parameter zum Öffnen eines Modals existiert
          var urlParams = new URLSearchParams(window.location.search);
          var openModal = urlParams.get("projekt_open_modal");
          if (openModal === "true") {
            // Entferne den Parameter aus der URL
            urlParams.delete("projekt_open_modal");
            var newUrl = window.location.pathname + "?" + urlParams.toString();
            window.history.replaceState({}, document.title, newUrl);
          }
        });
        console.log(projectId);
        this.on("sending", function (file, xhr, formData) {
          // CSRF-Token und Projekt-ID vor dem Senden hinzufügen
          formData.append("csrfmiddlewaretoken", csrftoken);
          formData.append("project_id", projectId);
        });
      },
      maxFiles: 5, // Maximale Anzahl der Dateien
      maxFilesize: 4, // Maximale Dateigröße in MB
      acceptedFiles:
        ".png, .jpg, .jpeg, .webp, .pdf, .txt, .docx, .xlsx, .pptx", // Zulässige Dateiformate
    });
  }



    // Funktion, die beim Öffnen des Modals aufgerufen wird
    var myModal = $('#exampleModalToggle');
    myModal.on('show.bs.modal', function (e) {

      setTimeout(performAjaxSearch, 100);
        
    });

    // Funktion, die den AJAX-Aufruf ausführt wen es einen wert gibt ansonsten nicht
    function performAjaxSearch() {
      var valprojektname = $('#projektname').val();
      if (valprojektname === '') {
        $.ajax({
          method: "GET",
          url: "/project/autocomplete/user/", // URL für die Autocomplete-Suche
          success: function (data) {
            var results = data.results; // Die Suchergebnisse

  

            var select2Options = [];

            // Iterieren Sie durch die Ergebnisse und erstellen Sie Optionen für Select2
            for (var i = 0; i < results.length; i++) {
                var user = results[i];
                var username = user.username;

                // Erstellen Sie ein Objekt für die Option
                var option = {
                    id: username,
                    text: username
                };

                // Fügen Sie die Option zum Array der Select2-Optionen hinzu
                select2Options.push(option);
            }

            // Leeren Sie das Dropdown-Feld und fügen Sie Select2-Optionen hinzu
            $("#multiple-select-field").empty().select2({
                theme: "bootstrap-5",
                width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
                placeholder: $( this ).data( 'placeholder' ),
                data: select2Options // Verwenden Sie das Array der Select2-Optionen
            });
    
            
          },
        });
      }
    }


  // Prjket Formular Evaluierung
  function validateForm() {
    var projektname = $("#projektname").val();
    var description = $("#description").val();
    var selectedUsers = $("#multiple-select-field").val();
  
    if (!projektname || projektname.trim() === '') {
      displayErrorMessage("Projektnamen ist erforderlich.");
      return false;
    }
  
    if (!description || description.trim() === '') {
      displayErrorMessage("Beschreibung ist erforderlich.");
      return false;
    }
  
  
    // Wenn alles ausgefüllt ist und die Validierung erfolgreich ist, wird true zurückgegeben.
    return true;
  }


  $("#projektname, #description, #multiple-select-field").on("input change", function () {
    hideErrorMessage();
  });

  function displayErrorMessage(message) {
    // Zeige die Fehlermeldung und setze den Text entsprechend
    $("#error-message").text(message);
    $("#error-message").show();
  }
  
  function hideErrorMessage() {
    // Verstecke die Fehlermeldung
    $("#error-message").hide();
  }


});
