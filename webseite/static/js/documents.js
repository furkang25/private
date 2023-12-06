$(document).ready(function () {


    //Parameter enziehen bei Projekt
    function documentParameterRemove(){
        // Überprüfen, ob der Parameter vorhanden ist
        if (window.location.search.indexOf('documents_open_modal=true') !== -1) {
        // Entfernen Sie den Parameter aus der URL
        var newUrl = window.location.href.replace('?documents_open_modal=true', '');

        // Verwenden Sie history.pushState, um die URL zu ändern
        history.pushState({}, document.title, newUrl);

        // Aktualisieren Sie die Seite
        location.reload();
    }
    }

    //Parameter enziehen bei Projekt funktions auslöser
    $('#closeDocument').click(function () {
        documentParameterRemove();
    console.log('run');
    });



    // Cookie
    // Funktion zum Abrufen eines Cookies anhand seines Namens
    const getCookie = (name) => {
        // Initialisiere die Variable cookieValue als null
        let cookieValue = null;

        // Überprüfe, ob Cookies existieren und ob sie nicht leer sind
        if (document.cookie && document.cookie !== '') {

            // Teile den Cookie-String an jedem Semikolon, um ein Array von Cookies zu erhalten
            const cookies = document.cookie.split(';');

            // Durchlaufe das Array von Cookies
            for (let i = 0; i < cookies.length; i++) {

                // Entferne Leerzeichen am Anfang und am Ende des Cookie-Strings
                const cookie = cookies[i].trim();

                // Überprüfe, ob der Cookie mit dem gesuchten Namen beginnt
                if (cookie.substring(0, name.length + 1) === (name + '=')) {

                    // Dekodiere den Wert des Cookies und speichere ihn in cookieValue
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

                    // Beende die Schleife, da das gesuchte Cookie gefunden wurde
                    break;
                }
            }
        }

        // Gebe den Wert des Cookies zurück oder null, falls es nicht gefunden wurde
        return cookieValue;
    };

    // Ruft den CSRF-Token aus den Cookies ab und speichert ihn in der Variable csrftoken
    const csrftoken = getCookie('csrftoken');


    // Markierung Methode
    // Funktion zum Überprüfen des Beobachtungsstatus eines Dokuments
    function checkDocumentsWatchlistStatus(user_id, documentId) {
        var user_id = user_id; // Benutzer-ID
        var project_id = documentId; // Dokument-ID (hier als Projekt-ID bezeichnet)

        // Ajax-Anfrage zum Überprüfen des Beobachtungsstatus
        $.ajax({
            url: '/documents/check-watchlist-status/' + user_id + '/' + project_id + '/',
            type: 'GET', // Anfragetyp ist GET
            dataType: 'json', // Daten werden im JSON-Format erwartet
            headers: {
                'X-CSRFToken': csrftoken // CSRF-Token für Sicherheit
            },
            success: function (data) { // Bei Erfolg der Anfrage
                // Finde das Icon-Element, das dem Dokument entspricht
                var iconElement = $('.bookmarkDocumentId[data-documents-bookmark="' + documentId + '"]');

                // Überprüfe, ob das Dokument in der Beobachtungsliste ist
                var isOnWatchlist = data.is_on_watchlist || false;

                // Füge oder entferne die Klasse 'watchlisted' abhängig vom Beobachtungsstatus
                if (isOnWatchlist) {
                    iconElement.addClass('watchlisted');
                } else {
                    iconElement.removeClass('watchlisted');
                }
            },
            error: function (error) { // Bei einem Fehler
                // Fehlerbehandlung: Logge den Fehler in der Konsole
                //console.log(error);
            }
        });
    }



    // Öffnet das Modal-Fenster, wenn der URL-Parameter 'documents_open_modal' den Wert 'true' hat
    function openModalIfParameterExists() {
        // URL-Parameter abrufen
        var urlParams = new URLSearchParams(window.location.search);
        var openModal = urlParams.get('documents_open_modal');

        // Modal-Fenster öffnen, falls der Parameter 'true' ist
        if (openModal === 'true') {
            $('#exampleDocumentsToggle').modal('show');
        }
    }

    // Diese Funktion wird beim Laden der Seite ausgeführt
    openModalIfParameterExists();

    // Watchliste
    // Ereignishandler für das Klicken auf ein Dokumenten-Bookmark
    $('#documentsCards').on('click', '.document-bookmark', function () {
        // Dokumenten-ID und Benutzer-ID holen
        var documents_id = $(this).attr('data-documents-bookmark');
        var user_id = $('#loginUserId').val();

        // Ajax-Anfrage zum Ändern des Beobachtungsstatus
        $.ajax({
            url: '/documents/toggle-watchlist/',
            method: 'POST',
            data: { user_id: user_id, documents_id: documents_id },
            headers: {
                'X-CSRFToken': csrftoken // CSRF-Token für die Sicherheit
            },
            success: function (data) {
                // Bei Erfolg, Beobachtungsstatus prüfen
                checkDocumentsWatchlistStatus(user_id, documents_id);
            },
            error: function () {
                // Fehlermeldung in der Konsole anzeigen
                console.log('Fehler beim Ändern der watch list.');
            }
        });
    });


    // Documents Deltet
    // Ereignishandler für das Klicken des "Löschen"-Buttons für Dokumente
    $('body').on('click', '.documents-delte-btn', function () {
        // Versteckt ein bereits offenes Modal-Fenster mit der ID 'exampleModalToggle2'
        $('#exampleModalToggle2').modal('hide');

        // Holt die ID des zu löschenden Dokuments aus dem 'data-documents-delete-id' Attribut
        var documentsDeleteId = $(this).data('documents-delete-id');
        console.log(documentsDeleteId);

        // Ajax-Anfrage zum Löschen des Dokuments
        $.ajax({
            url: `/documents/delete/${documentsDeleteId}/`, // URL zum Löschen des Dokuments
            method: 'POST', // HTTP-Methode ist POST
            dataType: 'json', // Erwarteter Rückgabetyp ist JSON
            headers: {
                'X-CSRFToken': csrftoken // CSRF-Token für Sicherheit
            },
            success: function (data) {
                // Bei erfolgreichem Löschen wird die Seite nach 100 Millisekunden neu geladen
                setTimeout(function () {
                    location.reload();
                }, 100);
            },
            error: function () {
                // Fehlermeldung wird in der Konsole ausgegeben, wenn die Ajax-Anfrage fehlschlägt
                console.error('Fehler bei der Ajax-Anfrage.');
            }
        });
    });



    // Dokumente Update Ansehen
    // Ereignishandler für das Klicken eines Dokumentelements
    $('#documentsCards').on('click', '.custome-documents', function () {
        // Holt die ID des angeklickten Dokuments aus dem 'data-documents-id' Attribut
        var dataDocuments = $(this).attr('data-documents-id');

        // Zeigt das Modal-Fenster mit der ID 'exampleDocumentsToggle'
        $('#exampleDocumentsToggle').modal('show');

        // Verändert die Sichtbarkeit von verschiedenen Formularen und Elementen im Modal
        $('#saveDocumentsFormDelete').removeClass('d-none');
        $('#saveDocumentsForm').addClass('d-none');
        $('#dropzoneDocs').addClass('d-none');
        $('#saveDocumentsFormUpdate').removeClass('d-none');

        // Ajax-Anfrage zum Abrufen der Dokumentinformationen
        $.ajax({
            url: `/documents/update/${dataDocuments}/`, // URL zum Abrufen der Dokumentinformationen
            method: 'GET', // HTTP-Methode ist GET
            dataType: 'json', // Erwarteter Rückgabetyp ist JSON

            success: function (data) {
                

                // Füllt das Formular im Modal mit den erhaltenen Daten
                $('#docummentIdForm').val(data.documents.id);
                $('#projektForm').val(data.documents.project);
                $('#projektHiddenId').val(data.documents.project_id);
                $('#tagHiddenId').val(data.documents.tags_id);
                $('#tagForm').val(data.documents.tags_name);
                $('#documentNameForm').val(data.documents.name);

                // Setzt das 'data-documents-delete-id' Attribut für den Löschen-Button
                $('#documentesDelete').attr('data-documents-delete-id', data.documents.id);
            },
            error: function () {
                // Fehlermeldung wird in der Konsole ausgegeben, wenn die Ajax-Anfrage fehlschlägt
                console.error('Fehler bei der Ajax-Anfrage.');
            }
        });
    });



    // Dokumente Update Speichern
    // Ereignishandler für das Klicken des 'saveDocumentsFormUpdate'-Buttons
    $('#saveDocumentsFormUpdate').on('click', function () {

        // Liest die Werte der versteckten Felder und des Namensfelds aus dem Formular
        var projektHiddenId = $('#projektHiddenId').val();
        var tagHiddenId = $('#tagHiddenId').val();
        var teamHiddenId = $('#teamHiddenId').val();
        var documentNameForm = $('#documentNameForm').val();

        // Liest die Dokumenten-ID aus dem versteckten Formularfeld
        var dataDocuments = $('#docummentIdForm').val();
        console.log(dataDocuments);

        // Erstellt ein Objekt mit den aktualisierten Daten
        var updatedData = {
            name: documentNameForm,
            tags: tagHiddenId,
            project: projektHiddenId,
            team: teamHiddenId,
        };

        // Ajax-Anfrage zum Aktualisieren der Dokumentdaten
        $.ajax({
            url: `/documents/update/${dataDocuments}/`, // URL zum Aktualisieren des Dokuments
            method: 'POST', // HTTP-Methode ist POST
            data: updatedData, // Übermittelte Daten
            dataType: 'json', // Erwarteter Rückgabetyp ist JSON
            headers: {
                'X-CSRFToken': csrftoken // CSRF-Token für Sicherheit
            },
            success: function (data) {
                // Erfolg: Seite wird nach kurzer Verzögerung neu geladen
                setTimeout(function () {
                    location.reload();
                    documentParameterRemove();
                }, 100);
            },
            error: function () {
                // Fehler: Fehlermeldung wird in der Konsole ausgegeben
                console.error('Fehler bei der Ajax-Anfrage.');
            }
        });

    });


    // Update Hidden fields
    // Ereignishandler für das Ändern des 'teamForm'-Dropdowns
    $('#teamForm').on('change', function () {
        $('#teamHiddenId').val(''); // Setzt den Wert des versteckten Felds 'teamHiddenId' zurück
    });

    // Ereignishandler für das Ändern des 'projektForm'-Dropdowns
    $('#projektForm').on('change', function () {
        $('#projektHiddenId').val(''); // Setzt den Wert des versteckten Felds 'projektHiddenId' zurück
    });

    // Ereignishandler für das Ändern des 'tagForm'-Dropdowns
    $('#tagForm').on('change', function () {
        $('#tagHiddenId').val(''); // Setzt den Wert des versteckten Felds 'tagHiddenId' zurück
    });



    // Documents list view
    var currentPage = 1;
    var isUser = false;
    var watchliste = false;

    // Beim Dokumentenstart wird die Liste der Dokumente gefiltert
    $(document).ready(function () {
        filterDocumentsByTags(currentPage); // Startseite
    });

    // Bei Klick auf einen Pagination-Link wird die Seite aktualisiert
    $(document).on('click', '.pagination-link', function () {
        var page = parseInt($(this).data('page')); // Holt die Seitennummer aus dem data-page Attribut
        filterDocumentsByTags(page); // Aktualisiert die Anzeige
    });



    // Die Funktion createPaginationLinks wird definiert, sie nimmt pageCount als Parameter.
    function createPaginationLinks(pageCount) {
        // Das Pagination-Container-Element mit der ID 'paginationContainer' wird ausgewählt und geleert.
        var paginationContainer = $('#paginationContainer');
        paginationContainer.empty();

        // Ein Link für die vorherige Seite wird erstellt und dem Pagination-Container hinzugefügt.
        var previousPageLink = $('<li class="page-item"><a class="page-link" href="javascript:void(0);" data-page="1">Previous</a></li>');
        paginationContainer.append(previousPageLink);

        // Eine Schleife läuft durch alle Seiten von 1 bis pageCount.
        for (var i = 1; i <= pageCount; i++) {
            // Für jede Seite wird ein Link erstellt.
            var pageLink = $('<li class="page-item"><a class="page-link pagination-link" href="javascript:void(0);" data-page="' + i + '">' + i + '</a></li>');

            // Wenn die aktuelle Seite der Seite entspricht, die gerade in der Schleife ist, wird die Klasse 'active' hinzugefügt.
            if (i === currentPage) {
                pageLink.addClass('active');
            }

            // Der erstellte Link wird dem Pagination-Container hinzugefügt.
            paginationContainer.append(pageLink);
        }

        // Ein Link für die nächste Seite wird erstellt und dem Pagination-Container hinzugefügt.
        var nextPageLink = $('<li class="page-item"><a class="page-link" href="javascript:void(0);" data-page="' + pageCount + '">Next</a></li>');
        paginationContainer.append(nextPageLink);
    }


    // Funktion, die Dokumente anhand von Tags filtert
    function filterDocumentsByTags(page) {

        // Liest Werte von verschiedenen Eingabeelementen auf der Webseite
        var searchQuery = $('#searchQuery').val();
        var selecteUser = $('#userSelect').val();
        var selectedTags = $('#selectTags').val();
        var dateFrom = $('#datepicker-from').val();
        var dateTo = $('#datepicker-to').val();

        var parameterValue;
        var page = parseInt(page);

        // Initialisiert ein leeres Objekt, das die Daten enthält, die an den Server gesendet werden sollen
        var dataToSend = {};

        // Fügt Suchanfrage hinzu, wenn sie mindestens 4 Zeichen lang ist
        if (searchQuery && searchQuery.length >= 4) {
            dataToSend.search_query = searchQuery;
        }

        // Fügt ausgewählte Tags hinzu
        if (selectedTags && selectedTags.length > 0) {
            dataToSend.selected_tags = selectedTags;
        }

        // Fügt ausgewähltes User hinzu
        if (selecteUser && selecteUser.length > 0) {
            dataToSend.selecteUser = selecteUser;
        }

        // Überprüft, ob die Datumsangaben gültig sind, und fügt sie hinzu
        var dateFromMoment = moment(dateFrom, 'DD.MM.YYYY');
        var dateToMoment = moment(dateTo, 'DD.MM.YYYY');
        if (dateFromMoment.isValid() && dateToMoment.isValid()) {
            // Wenn die Datumsangaben gültig sind, in das richtige Format konvertieren
            dataToSend.date_from = dateFromMoment.format('YYYY-MM-DD');
            dataToSend.date_to = dateToMoment.format('YYYY-MM-DD');
        }

        // Sendet eine AJAX-Anfrage an den Server
        $.ajax({
            url: '/documents/list/',
            method: 'GET',
            headers: { // NEU
                'X-CSRFToken': csrftoken // CSRF-Token für Sicherheit
            },
            data: {
                // Daten für die Serveranfrage
                selected_tags: selectedTags,
                date_from: dataToSend.date_from,
                date_to: dataToSend.date_to,
                search_query: searchQuery,
                selecte_user: dataToSend.selecteUser,
                is_user: isUser,
                show_watchlist: watchliste,
                projekt_id: projektIdVal,
                page: parseInt(page) // Wandelt die Seitennummer in einen Integer um
            },
            success: function (data) {
                // Code, der ausgeführt wird, wenn die Anfrage erfolgreich war

                currentPage = page; // Aktualisiere die aktuelle Seite

                var documentsCards = $('#documentsCards');
                documentsCards.empty();
                const documentsRow = $('<div class="row"></div>');

                data.documents.forEach(element => {

                    const tagsString = Array.isArray(element.tags) ? element.tags.join(', ') : '';

                    if (watchliste && !element.is_on_watchlist) {
                        return;
                    }

                    // Wahtchlist
                    var userLogin = $('#loginUserId').val();
                    documentId = element.id;
                    checkDocumentsWatchlistStatus(userLogin, documentId);

                    // Aktualisiert die Dokumentenkarten auf der Webseite
                    htmlCard = `
                    <div class="col-md-4 col-12 mb-4">
                        <div class="card card-custom h-100">
                            <div class="card-img-top-custom">
                                ${
                                    element.document.endsWith('.pdf') ? 
                                    '<i class="bi bi-file-earmark-pdf" style="font-size: 100px; color: red;"></i>' : 
                                    element.document.endsWith('.webp') || element.document.endsWith('.txt') || element.document.endsWith('.docx') || element.document.endsWith('.xlsx') || element.document.endsWith('.pptx') ? 
                                    '<i class="bi-file-earmark-text" style="font-size: 100px; color: red;"></i>' : 
                                    `<img src="${element.document}" class="card-img-top card-img-custom">
                                    `
                                }
                            </div>
                            <div class="card-body">
                                <h5 class="card-title card-title-custom">${element.name}</h5>
                                <p class="card-text">
                                    </p><small class="text-muted">Projekt: ${element.project}</p></small>
                                    <p><small class="text-muted">Hochgeladen von: ${element.user}</p></small>
                                    </p><small class="text-muted">Hochgeladen am: ${element.create}</p></small>
                                </p>
                                <i id="bookmarkId" data-documents-bookmark="${element.id}" class="icon-font fa-solid fa-book-bookmark document-bookmark bookmarkDocumentId me-2"></i>
                                <a href="javascript:void(0);" data-documents-id="${element.id}" class="btn btn-primary btn-sm mt-1 custome-documents me-2">Bearbeiten</a>
                                <a href="${element.document}" class="btn btn-primary btn-sm mt-1" target="_blank">Dokument anzeigen</a>
                            </div>
                        </div>
                    </div>
                `;
                    documentsRow.append(htmlCard);

                });
                documentsCards.append(documentsRow);

                // Aktualisiert die Paginierungslinks
                createPaginationLinks(data.page_count)

            },
            error: function (error) {
                // Verarbeiten Sie Fehler, wenn der Ajax-Aufruf fehlschlägt
                console.error('Fehler beim Abrufen der Dokumente: ' + error.statusText);
            }
        });
    }



    // Wenn das Tags-Auswahlfeld geändert wird, rufe filterDocumentsByTags() auf
    $('#selectTags').change(function () {
        filterDocumentsByTags();
    });

    // Wenn das "Von"-Datumsfeld geändert wird, überprüfe, ob auch ein "Bis"-Datum vorhanden ist und rufe dann filterDocumentsByTags() auf
    $('#datepicker-from').change(function () {
        var dateFrom = $(this).val();
        var dateTo = $('#datepicker-to').val();

        if (dateFrom && dateTo) {
            filterDocumentsByTags();
        }
    });

    // Wenn das "Bis"-Datumsfeld geändert wird, überprüfe, ob auch ein "Von"-Datum vorhanden ist und rufe dann filterDocumentsByTags() auf
    $('#datepicker-to').change(function () {
        var dateFrom = $('#datepicker-from').val();
        var dateTo = $(this).val();

        if (dateFrom && dateTo) {
            filterDocumentsByTags();
        }
    });

    // Wenn im Suchfeld mindestens 4 Zeichen eingegeben werden, rufe filterDocumentsByTags() auf
    $('#searchQuery').keyup(function () {
        var searchQuery = $(this).val();
        if (searchQuery.length >= 4) {
            filterDocumentsByTags(searchQuery);
        }
    });

    // Wenn das Team-Auswahlfeld geändert wird, rufe filterDocumentsByTags() auf
    $('#userSelect').change(function () {
        filterDocumentsByTags();
    });


    // Diese Funktion holt den Wert eines bestimmten URL-Parameters.
    function getUrlParameter(parameterName) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(parameterName);
    }

    // Lese die URL-Parameter 'meine_documente' und 'projekt_id'
    var meineDocumenteParameter = getUrlParameter('meine_documente');
    var projektIdParameter = getUrlParameter('projekt_id');

    // Überprüfe, ob der Parameter 'meine_documente' den Wert 'true' hat.
    if (meineDocumenteParameter === 'true') {
        // Logge eine Nachricht in der Konsole.
        console.log('Parameter "meine_documente" ist wahr.');
        // Setze die Variable 'isUser' auf true
        isUser = true;
        // Rufe die Funktion filterDocumentsByTags mit 'isUser' als Parameter auf
        filterDocumentsByTags(isUser);
    }

    // Überprüfe, ob der Parameter 'projekt_id' vorhanden ist.
    if (projektIdParameter) {
        // Logge eine Nachricht in der Konsole.
        console.log('Parameter "projekt_id" ist wahr.');
        // Setze die Variable 'projektIdVal' auf den Wert von 'projektIdParameter'
        var projektIdVal = projektIdParameter;
        // Rufe die Funktion filterDocumentsByTags mit 'projektIdVal' als Parameter auf
        filterDocumentsByTags(projektIdVal);
    } else {
        // Wenn 'projekt_id' nicht gesetzt ist, rufe die Funktion filterDocumentsByTags ohne Parameter auf
        filterDocumentsByTags();
    }


    // Bei einem Klick auf den Button '#userDocuments', setze 'isUser' auf true und rufe filterDocumentsByTags auf
    $('#userDocuments').on('click', function (event) {
        event.preventDefault();
        // Setzt watchliste filter auf false
        watchliste = false;
        isUser = true;
        filterDocumentsByTags(isUser);

    });


    // Bei einem Klick auf den Button '#watchlisteuserDocuments', setze 'watchliste' auf true und rufe filterDocumentsByTags auf
    $('#watchlisteuserDocuments').on('click', function (event) {
        event.preventDefault();
        // Setzt User filter auf false
        isUser = false;
        watchliste = true;
        filterDocumentsByTags(watchliste);
    });




    // Bei einem Klick auf den Button '#resteDocuments', lade die Seite nach 200 Millisekunden neu
    $('#resteDocuments').on('click', function () {
        isUser = false;
        watchliste = false;
        filterDocumentsByTags(isUser, watchliste);
        // setTimeout(function () {
        //     location.reload();
        // }, 200);
    })

    // Filter Reset
    $('#resetDocumentsfilter').on('click',  function (){
        setTimeout(function () {
            location.reload();
        }, 200);
    });

    //Überprüfen die Änderungen in den auswählbaren Feldern filter reset
    $('#selectTags, #datepicker-from, #datepicker-to, #userSelect, #searchQuery').on('change', function () {
        // Entfernen Sie die Klasse "d-none" vom Reset-Button
        $('#resetDocumentsfilter').removeClass('d-none');
    });



    // Diese Funktion entfernt alle URL-Parameter.
    function removeUrlParameters() {
        // Nutze 'history.replaceState', um die URL zu aktualisieren, ohne die Seite neu zu laden.
        // Dabei werden die URL-Parameter entfernt, und nur der Pfad bleibt erhalten.
        history.replaceState({}, document.title, window.location.pathname);
    }

    // Hole den Button mit der ID 'resteDocuments' und speichere ihn in der Variable 'resetButton'.
    var resetButton = document.getElementById('resteDocuments');

    // Überprüfe, ob der Button existiert.
    if (resetButton) {
        // Füge einen Event-Listener für den 'click'-Event hinzu.
        resetButton.addEventListener('click', function () {
            // Rufe die Funktion 'removeUrlParameters' auf, wenn der Button geklickt wird.
            removeUrlParameters();
        });
    }


    // Date Time
    // Initialisiere Datepicker für die Felder "datepicker-from" und "datepicker-to"
    $(function () {
        // Setze das Format für das "datepicker-from" Feld
        $("#datepicker-from").datepicker({
            dateFormat: 'dd.mm.yy'
        });
        // Setze das Format für das "datepicker-to" Feld
        $("#datepicker-to").datepicker({
            dateFormat: 'dd.mm.yy'
        });
    });

    // Funktion zum Laden der Projekt in ein Dropdown-Menü 
    function loadUser() {
        // Führe einen AJAX-Aufruf aus
        $.ajax({
            url: '/documents/user/select/',  // Die URL, an die die Anfrage gesendet wird
            method: 'GET',                    // Die Methode der Anfrage
            dataType: 'json',                 // Der erwartete Datentyp der Antwort
            success: function (data) {         // Was geschieht, wenn die Anfrage erfolgreich ist
                // Hole das Dropdown-Menü mit der ID 'teamSelect'
                var select = $('#userSelect');
                select.empty();

                select.prepend('<option value="" selected="selected">Hochgeladen von...</option>');
                // Iteriere durch das Team-Array
                for (var i = 0; i < data.users.length; i++) {
                    // Hole das aktuelle Team
                    var users = data.users[i];
                    // Füge das Team als Option zum Dropdown-Menü hinzu
                    select.append('<option value="' + users.id + '">' + users.username + '</option>');
                }
            },
            error: function () {               // Was geschieht, wenn die Anfrage fehlschlägt
                // Logge eine Fehlermeldung in die Konsole
                console.error('Fehler beim Laden der Teams.');
            }
        });
    }

    // Rufe die Funktion loadTeams auf, um die Teams beim Laden der Seite zu holen
    loadUser();



    // Funktion zum Laden der Tags in ein Dropdown-Menü
    function loadTags() {
        // AJAX-Aufruf, um die Tags vom Server zu holen
        $.ajax({
            url: '/documents/tags/select/',  // URL für die Anfrage
            method: 'GET',                   // Verwendete Methode
            dataType: 'json',                // Erwarteter Rückgabetyp
            success: function (data) {        // Funktion bei erfolgreichem Aufruf
                // Zugriff auf das Dropdown-Menü mit der ID 'selectTags'
                var select = $('#selectTags');
                select.empty();

                // Fügen eine leere Option als Platzhalter hinzu
                select.prepend('<option value="" selected="selected">Tag auswählen...</option>');

                // Schleife durch alle Tags
                for (var i = 0; i < data.tags.length; i++) {
                    // Speichere aktuelles Tag-Objekt
                    var tag = data.tags[i];
                    // Füge das Tag als Option zum Dropdown-Menü hinzu
                    select.append('<option value="' + tag.id + '">' + tag.name + '</option>');
                }
            },
            error: function () {              // Funktion bei Fehler
                // Logge eine Fehlermeldung in die Konsole
                console.error('Fehler beim Laden der Tags.');
            }
        });
    }

    // Lade die Tags, wenn die Seite geladen wird
    loadTags();


    $('body').on('click', '#closeDocument', function () {
        // Setze alle Formularfelder zurück
        $('#teamForm').val('');
        $('#teamHiddenId').val('');
        $('#tagForm').val('');
        $('#tagHiddenId').val('');
        $('#projektForm').val('');
        $('#projektHiddenId').val('');
        $('#documentNameForm').val('');
    
        // Hole Dropzone-Instanz und entferne alle hochgeladenen Dateien
        var myDropzone = Dropzone.forElement("#dropzoneDocs");
        myDropzone.removeAllFiles();
    
        // Schließe das Formular oder Modal
        $('#meinFormular').hide();  // oder $('#myModal').modal('hide'); wenn es ein Modal ist
    
        // Aktualisieren der Seite
        location.reload();
    });
    


    // Crate Documments
    // Funktion zum Initialisieren der Dropzone-Bibliothek für Dateiuploads
    function initializeDropzone() {
        // Erstelle eine neue Dropzone-Instanz mit der angegebenen Konfiguration
        var myDropzone = new Dropzone("#dropzoneDocs", {
            url: '/documents/create/',  // URL für den Upload
            headers: {
                'X-CSRFToken': csrftoken // CSRF-Token für Sicherheit
            },
            init: function () {  // Initialisierungsfunktion
                // Speichern des Buttons zur Übermittlung des Formulars in einer Variable
                var submitButton = document.querySelector("#saveDocumentsForm");
                myDropzone = this;  // Speichern der Dropzone-Instanz in einer Variable

                // Füge einen Event-Listener zum Submit-Button hinzu
                submitButton.addEventListener("click", function () {
                    // Prozessiere die Warteschlange der Dropzone (startet den Upload)
                    myDropzone.processQueue();
                });

                // Event-Handler für erfolgreiche Uploads
                this.on("success", function (file, response) {
                    // Zeige eine Erfolgsmeldung an
                    var alertDocument = $('#alertDocument');
                    alertDocument.append(`
                <div class="alert alert-success" role="alert">
                    Das Dokument wurde hochgeladen!
                </div>
                `);
                    // Verberge die Erfolgsmeldung nach 1 Sekunde
                    setTimeout(function () {
                        $('#alertDocument').hide('');
                    }, 5000);

                    // Entferne den URL-Parameter 'documents_open_modal', falls vorhanden
                    var urlParams = new URLSearchParams(window.location.search);
                    var openModal = urlParams.get('documents_open_modal');
                    if (openModal === 'true') {
                        urlParams.delete('documents_open_modal');
                        var newUrl = window.location.pathname + '?' + urlParams.toString();
                        window.history.replaceState({}, document.title, newUrl);
                    }
                });

                // Event-Handler für das Senden des Formulars
                this.on('sending', function (file, xhr, formData) {
                    // Hole alle relevanten Formulardaten
                    var documentNameForm = $('#documentNameForm').val();
                    var loginUserId = $('#loginUserId').val();
                    var teamHiddenId = $('#teamHiddenId').val();
                    var tagHiddenId = $('#tagHiddenId').val();
                    var projektHiddenId = $('#projektHiddenId').val();

                    // Füge diese Daten dem FormData-Objekt hinzu
                    formData.append('csrfmiddleware token', csrftoken);
                    formData.append('name', documentNameForm);
                    formData.append('user', loginUserId);
                    formData.append('team', teamHiddenId);
                    formData.append('project', projektHiddenId);
                    formData.append('tags', tagHiddenId);
                });
            },
            // Weitere Dropzone-Optionen
            maxFiles: 5,  // Maximale Anzahl der Dateien
            maxFilesize: 4,  // Maximale Dateigröße in MB
            addRemoveLinks: true,  // Zeige "Entfernen"-Links
            clickable: true,  // Dropzone ist anklickbar
            acceptedFiles: '.png, .jpg, .jpeg, .webp, .pdf, .txt, .docx, .xlsx, .pptx',  // Akzeptierte Dateitypen
            autoProcessQueue: false  // Automatisches Verarbeiten der Warteschlange deaktiviert
        });
    }

    // Initialisiere die Dropzone, wenn die Seite geladen wird
    initializeDropzone();



    // Team Autocomplete
    // Event-Listener für Eingaben im '#teamForm'-Feld
    $('#teamForm').on('input', function () {
        // Hole den eingegebenen Text aus dem Eingabefeld
        var query = $(this).val();

        // Starte einen AJAX-Aufruf an den Server
        $.ajax({
            url: '/documents/autocomplete/team/',  // URL der Ressource auf dem Server
            data: { q: query },  // Daten, die an den Server gesendet werden
            success: function (data) {  // Erfolgs-Callback-Funktion
                // Extrahiere die Suchergebnisse aus der Serverantwort
                var results = data.results;

                // Leere die vorherigen Suchergebnisse
                var resultList = $('#teamResults');
                resultList.empty();

                // Erstelle eine neue ungeordnete Liste für die Suchergebnisse
                var resultList = $('<ul>');

                // Gehe durch jedes Suchergebnis
                $.each(results, function (index, item) {
                    // Erstelle ein neues Listen-Element für jedes Suchergebnis
                    var listItem = $('<li class="team-item">')
                        .attr('data-id', item.id)  // Setze die Daten-ID
                        .text(item.name);  // Setze den Text des Elements

                    // Füge das Listen-Element zur Ergebnisliste hinzu
                    resultList.append(listItem);
                });

                // Füge die gesamte Ergebnisliste zum Container '#teamResults' hinzu
                $('#teamResults').append(resultList);
            }
        });
    });


    // Team Handle selection 
    // Event-Handler für die Auswahl eines Teams aus der Suchergebnisliste
    $(document).on('click', '.team-item', function () {
        // Hole die Daten-ID und den Text des angeklickten Elements
        var teamId = $(this).data('id');
        var teamName = $(this).text();

        // Referenz auf das Element, das die Suchergebnisse enthält
        var resultList = $('#teamResults');

        // Verzögerung in Millisekunden, bis die Ergebnisliste geleert wird
        var hideDelay = 300;

        // Setze den Team-Namen im Eingabefeld und speichere die Team-ID in einem versteckten Feld
        $('#teamForm').val(teamName);
        $('#teamHiddenId').val(teamId);

        // Leere die Ergebnisliste nach der festgelegten Verzögerung
        setTimeout(function () {
            resultList.empty();
        }, hideDelay);
    });



    // Tag Autocomplete
    // Ereignishandler, der bei Eingabe im "#tagForm"-Feld ausgelöst wird
    $('#tagForm').on('input', function () {
        // Speichere den aktuellen Inhalt des Eingabefelds in der Variable "query"
        var query = $(this).val();

        // Führe einen AJAX-Aufruf aus, um Tags für die Autovervollständigung abzurufen
        $.ajax({
            url: '/documents/autocomplete/tags/', // Die URL der API für die Autovervollständigung
            data: { q: query }, // Sende die Eingabe als Query-Parameter
            success: function (data) { // Wenn der AJAX-Aufruf erfolgreich ist, führe diese Funktion aus
                // Speichere die Suchergebnisse in der Variable "results"
                var results = data.results;

                // Leere die bisherigen Suchergebnisse
                var resultList = $('#tagResults');
                resultList.empty();

                // Erstelle eine neue ungeordnete Liste für die Suchergebnisse
                var resultList = $('<ul>');

                // Durchlaufe alle Suchergebnisse und füge sie der Liste hinzu
                $.each(results, function (index, item) {
                    var listItem = $('<li class="tags-item">') // Erstelle ein neues Listenitem
                        .attr('data-id', item.id)  // Füge die ID des Tags als Datenattribut hinzu
                        .text(item.name);          // Setze den Text des Listenelements auf den Namen des Tags
                    resultList.append(listItem);
                });

                // Füge die erstellte Liste den bisherigen Suchergebnissen hinzu
                $('#tagResults').append(resultList);
            }
        });
    });



    // Tags Handle selection 
    // Diese Funktion wird aufgerufen, wenn ein Element mit der Klasse "tags-item" angeklickt wird.
    $(document).on('click', '.tags-item', function () {
        // Die Daten-ID des angeklickten Elements wird in die Variable "teamId" gespeichert.
        var teamId = $(this).data('id');
        // Der Text des angeklickten Elements wird in die Variable "teamName" gespeichert.
        var teamName = $(this).text();

        // Ein Referenz zum Element mit der ID "tagResults" wird in der Variable "resultList" gespeichert.
        var resultList = $('#tagResults');
        // Die Zeit in Millisekunden, die gewartet wird, bevor "resultList" geleert wird.
        var hideDelay = 300;

        // Der Wert von "teamName" wird in das Input-Feld mit der ID "tagForm" gesetzt.
        $('#tagForm').val(teamName);
        // Der Wert von "teamId" wird in das versteckte Feld mit der ID "tagHiddenId" gesetzt.
        $('#tagHiddenId').val(teamId);

        // Die Funktion "setTimeout" wird aufgerufen, um die "resultList" nach der "hideDelay"-Zeit zu leeren.
        setTimeout(function () {
            resultList.empty();
        }, hideDelay);
    });



    // Project Autocomplete
    // Diese Funktion wird aufgerufen, wenn der Benutzer im Input-Feld mit der ID "projektForm" tippt.
    $('#projektForm').on('input', function () {
        // Der aktuelle Wert des Input-Feldes wird in der Variable "query" gespeichert.
        var query = $(this).val();

        // Ein AJAX-Request wird gestartet, um Projektnamen basierend auf dem eingegebenen Text zu suchen.
        $.ajax({
            url: '/documents/autocomplete/projets/',  // URL der Backend-Ressource
            data: { q: query },  // Die Eingabe des Benutzers wird als Parameter "q" übergeben.
            success: function (data) {  // Funktion, die bei erfolgreicher Antwort aufgerufen wird.
                // Die erhaltenen Ergebnisse werden in der Variable "results" gespeichert.
                var results = data.results;

                // Ein Referenz zum Element mit der ID "projektResults" wird in der Variable "resultList" gespeichert.
                var resultList = $('#projektResults');
                // Das Element "resultList" wird geleert.
                resultList.empty();

                // Ein neues "ul"-Element wird erstellt.
                var resultList = $('<ul>');

                // Für jedes zurückgegebene Ergebnis wird ein "li"-Element erstellt.
                $.each(results, function (index, item) {
                    // Ein neues "li"-Element mit der Klasse "project-item" wird erstellt und mit Daten befüllt.
                    var listItem = $('<li class="project-item">').attr('data-id', item.id).text(item.name);
                    // Das "li"-Element wird zur "resultList" hinzugefügt.
                    resultList.append(listItem);
                });

                // Die gefüllte "resultList" wird zum Element mit der ID "projektResults" hinzugefügt.
                $('#projektResults').append(resultList);
            }
        });
    });



    // Project Handle selection 
    // Diese Funktion reagiert auf Klicks auf Elemente mit der Klasse "project-item".
    $(document).on('click', '.project-item', function () {
        // Die ID des geklickten Projekts wird aus dem data-id-Attribut extrahiert.
        var teamId = $(this).data('id');

        // Der Name des geklickten Projekts wird aus dem Textinhalt des Elements geholt.
        var teamName = $(this).text();

        // Ein Verweis auf das Element, das die Projektergebnisse enthält, wird erstellt.
        var resultList = $('#projektResults');

        // Zeitverzögerung in Millisekunden für das Leeren der Ergebnisliste.
        var hideDelay = 300;

        // Der Name des geklickten Projekts wird in das Input-Feld mit der ID "projektForm" gesetzt.
        $('#projektForm').val(teamName);

        // Die ID des geklickten Projekts wird in das versteckte Input-Feld mit der ID "projektHiddenId" gesetzt.
        $('#projektHiddenId').val(teamId);

        // Nach der Zeitverzögerung wird die Ergebnisliste geleert.
        setTimeout(function () {
            resultList.empty();
        }, hideDelay);
    });



});