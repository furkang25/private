// Sobald das Dokument geladen ist, führt die Funktion ihren Code aus.
$(document).ready(function () {

    // Funktion zum Abrufen eines Cookies anhand seines Namens
    const getCookie = (name) => {
        // Initialisiere cookieValue mit null
        let cookieValue = null;

        // Überprüfen, ob Cookies vorhanden sind
        if (document.cookie && document.cookie !== '') {
            // Aufteilen des Cookie-Strings in ein Array
            const cookies = document.cookie.split(';');

            // Durchlaufen aller Cookies
            for (let i = 0; i < cookies.length; i++) {
                // Entfernen von Leerzeichen am Anfang und Ende des Cookies
                const cookie = cookies[i].trim();

                // Überprüfen, ob der Cookie-String mit dem gesuchten Namen beginnt
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    // Extrahieren des Cookie-Werts und Dekodieren von URL-codierten Zeichen
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        // Rückgabe des gefundenen Cookie-Werts oder null, wenn nicht gefunden
        return cookieValue;
    };

    // Abrufen des CSRF-Tokens aus dem Cookie
    const csrftoken = getCookie('csrftoken');


    // 1. Func Crate Comment
    // Funktion zum Erstellen eines Kommentars
    function crateComment(projektId, commentText) {
        // AJAX-POST-Anfrage an den Server, um einen neuen Kommentar zu erstellen
        $.ajax({
            // URL, an die die Anfrage gesendet wird
            url: `/project/comment/create/${projektId}/`,
            // HTTP-Methode
            method: 'POST',
            // Setzen des CSRF-Tokens im Header für die Sicherheit
            headers: {
                'X-CSRFToken': csrftoken
            },
            // Daten, die an den Server gesendet werden
            data: {
                text: commentText, // Kommentartext
            },
            // Erfolgsfunktion: Wird aufgerufen, wenn die Anfrage erfolgreich ist
            success: function (data) {
                // Aktualisiert die Kommentarliste für das spezifische Projekt
                updateCommentFunc(projektId);
                // Leert das Eingabefeld für den Kommentar
                $('#commentForm').val('');
                // Schließt das Kommentar-Modal
                $('#exampleComment').modal('hide');
            },
            // Fehlerfunktion: Wird aufgerufen, wenn ein Fehler auftritt
            error: function (data) {
                // Loggt die Fehlermeldung in der Konsole
                console.log(data.error);
            }
        });
    };


    // 2. Func Update Comment
    // Funktion zum Aktualisieren eines Kommentars
    function updateComment(projektId, commentId, commentText) {
        // AJAX-POST-Anfrage an den Server, um den Kommentar zu aktualisieren
        $.ajax({
            // URL, an die die Anfrage gesendet wird
            url: `/project/comment/update/${commentId}/`,
            // HTTP-Methode
            method: 'POST',
            // Setzen des CSRF-Tokens im Header für die Sicherheit
            headers: {
                'X-CSRFToken': csrftoken
            },
            // Daten, die an den Server gesendet werden
            data: {
                text: commentText,  // Kommentartext
            },
            // Erfolgsfunktion: Wird aufgerufen, wenn die Anfrage erfolgreich ist
            success: function (data) {
                // Aktualisiert die Kommentarliste für das spezifische Projekt
                updateCommentFunc(projektId);
                // Leert das Eingabefeld für den Kommentar
                $('#commentForm').val('');
                // Schließt das Kommentar-Modal
                $('#exampleComment').modal('hide');
            },
            // Fehlerfunktion: Wird aufgerufen, wenn ein Fehler auftritt
            error: function (data) {
                // Loggt die Fehlermeldung in der Konsole
                console.log(data.error);
            }
        });
    };


    // Func Delete Comment
    // Funktion zum Löschen eines Kommentars
    function deleteComment(commentId, projektId) {
        // AJAX-POST-Anfrage an den Server, um den Kommentar zu löschen
        $.ajax({
            // URL, an die die Anfrage gesendet wird
            url: `/project/comment/${commentId}/`,
            // HTTP-Methode
            method: 'POST',
            // Setzen des CSRF-Tokens im Header für die Sicherheit
            headers: {
                'X-CSRFToken': csrftoken
            },
            // Erfolgsfunktion: Wird aufgerufen, wenn die Anfrage erfolgreich ist
            success: function (data) {
                // Aktualisiert die Kommentarliste für das spezifische Projekt
                updateCommentFunc(projektId);
                // Schließt das Modal zum Löschen des Kommentars
                $('#exampleDeleteComment').modal('hide');
            },
            // Fehlerfunktion: Wird aufgerufen, wenn ein Fehler auftritt
            error: function (data) {
                // Loggt die Fehlermeldung in der Konsole
                console.log(data.error);
            }
        });
    };



    // 3. Open Modal Create Commment 
    // Funktion zum Öffnen des Modal-Fensters für das Erstellen eines Kommentars
    $('#crateComment').on('click', function () {
        // Holt die Projekt-ID aus dem Datenattribut des Bookmarks
        var projektId = $('#bookmarkId').attr('data-project-bookmark');
        // Setzt die Projekt-ID in das versteckte Feld im Formular
        $('#projekt_id').val(projektId);
        // Zeigt das Modal-Fenster für das Erstellen eines Kommentars
        $('#exampleComment').modal('show');
    });



    // 4. Crate Comment Save
    // Funktion zum Speichern des neuen Kommentars
    $('#submit-comment').on('click', function (e) {
        // Verhindert das Standardverhalten des Buttons
        e.preventDefault();
        // Holt die Projekt-ID und den Kommentartext aus dem Formular
        var projektId = $('#projekt_id').val();
        var commentText = $('#commentForm').val();
        // Ruft die Funktion zum Erstellen eines Kommentars auf
        crateComment(projektId, commentText);
    });



    // 5. Open Model Crate Comment
    // Funktion zum Öffnen des Modal-Fensters zum Aktualisieren eines Kommentars
    $('body').on('click', '.update-comment-data', function () {
        // Ändert die Sichtbarkeit der Buttons im Formular
        $('#update-comment').removeClass('d-none');
        $('#submit-comment').addClass('d-none');
        // Holt die Projekt-ID und Kommentar-ID aus den Datenattributen
        var projektId = $('#bookmarkId').attr('data-project-bookmark');
        var commentId = $(this).attr('data-comment-id');
        // Holt den aktuellen Kommentartext
        var commentText = $(this).closest('.col-12').find('.commentText').text();
        // Setzt die gesammelten Daten in die Formularfelder
        $('#comment_id').val(commentId);
        $('#commentForm').val(commentText);
        $('#projekt_id').val(projektId);
        // Zeigt das Modal-Fenster
        $('#exampleComment').modal('show');
    });



    // 6. Update Comment Save
    // Diese Funktion wird ausgelöst, wenn der Benutzer auf den "Update Comment"-Knopf klickt.
    $('#update-comment').on('click', function () {
        // Sammelt die benötigten Daten aus den entsprechenden Formularfeldern.
        var projektId = $('#projekt_id').val();
        var commentId = $('#comment_id').val();
        var commentText = $('#commentForm').val();
        // Ruft die Funktion `updateComment` auf, um den Kommentar zu aktualisieren.
        updateComment(projektId, commentId, commentText)
    });



    // 7. Open Delte Comment
    // Öffnet ein Modal, um die Löschung eines Kommentars zu bestätigen.
    $('body').on('click', '.comment-delete-data', function () {
        // Ändert die Textfarbe des Kommentars, um den Benutzer auf die bevorstehende Löschung hinzuweisen.
        $(this).closest('.col-12').find('.commentText').css('color', 'red');
        // Setzt den Bestätigungstext im Modal.
        $('#textDelateCommment').text('Kommentar löschen bestätigen');
        // Speichert die Projekt- und Kommentar-IDs in verborgenen Formularfeldern.
        var projektId = $('#bookmarkId').attr('data-project-bookmark');
        var commentId = $(this).attr('data-comment-id');
        $('#projektCommentID').val(projektId);
        $('#commentDeleteID').val(commentId);
        // Zeigt das Lösch-Bestätigungsmodal.
        $('#exampleDeleteComment').modal('show');
    });



    // // 8. Delete Comment
    // Führt die Löschung des Kommentars aus, wenn der Benutzer die Löschung im Modal bestätigt.
    $('#comment-delete').on('click', function () {
        // Holt die IDs für das Projekt und den Kommentar aus den verborgenen Formularfeldern.
        var commentId = $('#commentDeleteID').val();
        var projektId = $('#projektCommentID').val();
        // Ruft die `deleteComment` Funktion auf, um den Kommentar tatsächlich zu löschen.
        deleteComment(commentId, projektId);
    });



    // Update Comment View
    // Diese Funktion wird aufgerufen, um die Liste der Kommentare zu aktualisieren.
    function updateCommentFunc(project_id) {
        // AJAX-Anfrage, um die Details des Projekts und die dazugehörigen Kommentare zu erhalten.
        $.ajax({
            url: '/project/project-detail/' + project_id + '/',
            method: 'GET',
            success: function (data) {
                // Löscht alle vorhandenen Kommentare im Container.
                $('#commentsContainer').empty();
                // Durchläuft die Liste der Kommentare und fügt sie dem Container hinzu.
                data.comments.forEach(function (document) {
                    // Erstellt das HTML für jeden Kommentar.
                    var htmlComments = `
                <div class="col-12 mt-5">
                    <figure>
                    <figcaption class="blockquote-footer">
                        <cite title="Source Title" class="user-name">
                        ${document.user} ${document.can_edit ? `<i data-comment-id="${document.id}" class="update-comment-data fa-regular fa-pen-to-square"></i> <i data-comment-id="${document.id}" class="comment-delete-data fa-solid fa-trash"></i>` : ''} 
                        </cite>
                    </figcaption>
                    </figure>
                    <small id="commentText">${document.text}</small><br>
                    <small>${document.date}</small>
                    <hr>
                </div>
                `;
                    // Fügt das erstellte HTML dem Kommentar-Container hinzu.
                    $('#commentsContainer').append(htmlComments);
                });
            },
            error: function () {
                // Gibt eine Fehlermeldung aus, wenn die Daten nicht abgerufen werden können.
                console.log('Fehler beim Abrufen der Projektinformationen.');
            }
        });
    };


    // Modal leeren
    // Diese Funktion wird aufgerufen, wenn der Benutzer auf den "Schließen"-Knopf des Modal-Fensters klickt.
    $('#commentCloseModal').on('click', function () {
        // Setzt den Wert des Kommentarformulars zurück.
        $('#commentForm').val('');
        // Setzt die versteckten Felder für Benutzer-ID, Projekt-ID und Kommentar-ID zurück.
        $('#user_id').val('');
        $('#projekt_id').val('');
        $('#comment_id').val('');
    });


}); // JS ist bereit