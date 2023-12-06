// Diese Funktion wird ausgeführt, sobald das Dokument vollständig geladen ist.
$(document).ready(function () {

    //Cookie-Handhabung am Dokumentenstart
    // Funktion zur Abfrage eines Cookies
    const getCookie = (name) => {
        // Initialisierung der Variablen für den Cookie-Wert
        let cookieValue = null;
        // Überprüfung, ob Cookies vorhanden sind
        if (document.cookie && document.cookie !== '') {
            // Aufteilen des Cookie-Strings in ein Array
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                // Entfernen von zusätzlichen Leerzeichen
                const cookie = cookies[i].trim();
                // Überprüfung, ob der Cookie mit dem gesuchten Namen beginnt
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    // Dekodierung und Speicherung des Cookie-Werts
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        // Rückgabe des Cookie-Werts
        return cookieValue;
    }
    // Abrufen des CSRF-Tokens aus dem Cookie
    const csrftoken = getCookie('csrftoken');

    //Tags über Ajax erstellen
    // Klick-Event-Handler für die Schaltfläche zur Erstellung von Tags
    $('#submitTags').on('click', function (e) {
        // Verhindert das standardmäßige Verhalten des Formulars (Seitenneuladen)
        e.preventDefault();

        // Holt den Wert aus dem Eingabefeld für Tags
        var tageForm = $('#tageForm').val();

        // Ajax-Anfrage an den Server, um Tags zu erstellen
        $.ajax({
            url: '/documents/create-tags/',  // Ziel-URL
            method: 'POST',                  // HTTP-Methode
            headers: {
                'X-CSRFToken': csrftoken     // CSRF-Token im Header mitgeben
            },
            data: {
                tageForm: tageForm           // Daten, die an den Server gesendet werden
            },
            success: function (data) {         // Bei erfolgreicher Antwort
                console.log(data);            // Daten im Konsolenlog ausgeben
                setTimeout(function () {
                    location.reload();        // Seite nach 200ms neu laden
                }, 200);
            },
            error: function (data) {           // Bei fehlerhafter Antwort
                console.log(data.error);      // Fehlermeldung im Konsolenlog ausgeben
            }
        });
    });

    //Tags über Ajax abrufen und im Modal anzeigen
    // Klick-Event-Handler für die Schaltfläche, die das Modal öffnet
    $('#exampleTags').on('click', function () {
        // Modal anzeigen
        $('#exampleTagsUpdate').modal('show');

        // Ajax-Anfrage an den Server, um alle Tags abzurufen
        $.ajax({
            url: '/documents/tags/select/',  // Ziel-URL
            method: 'GET',                   // HTTP-Methode
            dataType: 'json',                // Erwarteter Datentyp der Antwort
            success: function (data) {        // Bei erfolgreicher Antwort

                var tagsResultsDiv = $('#tagsResults');  // Div, in dem die Tags angezeigt werden
                tagsResultsDiv.empty();  // Vorhandene Tags im Div entfernen

                // Durchlaufen der Tags im Antwortobjekt
                $.each(data.tags, function (index, item) {
                    // HTML-Struktur für jeden Tag erstellen
                    html = `
                <div class="input-group mt-3">
                    <input type="text" class="form-control" id="tageFormVal${item.id}" value="${item.name}">
                    <button data-tags-edit="${item.id}" class="btn btn-outline-secondary tagsEdit" type="button">Speichern</button>
                    <button data-tags-delete="${item.id}" class="btn btn-outline-danger tagsDelste" type="button">Löschen</button>
                </div>
                `;
                    // HTML zum Div hinzufügen
                    tagsResultsDiv.append(html);
                });

            },
            error: function () {  // Bei fehlerhafter Antwort
                console.error('Fehler beim Laden der Tags.');
            }
        });
    });

    //Bearbeiten von Tags mit Ajax
    // Klick-Event-Handler für die Bearbeiten-Schaltflächen in der Tags-Liste
    $('body').on('click', '.tagsEdit', function () {
        // ID des zu bearbeitenden Tags abrufen
        var tagsId = $(this).attr('data-tags-edit');
        // Wert des zugehörigen Eingabefelds abrufen
        var tageFormVal = $('#tageFormVal' + tagsId).val();

        // Daten für die Ajax-Anfrage vorbereiten
        var updatedData = {
            name: tageFormVal,
        };

        // Ajax-Anfrage senden
        $.ajax({
            url: `/documents/update/tags/${tagsId}/`,  // URL für die Aktualisierung
            method: 'POST',                            // HTTP-Methode
            data: updatedData,                         // zu sendende Daten
            dataType: 'json',                          // erwarteter Datentyp der Antwort
            headers: {
                'X-CSRFToken': csrftoken               // CSRF-Token für die Sicherheit
            },
            success: function (data) {                  // Erfolgsfall
                // Die Seite nach einer kurzen Verzögerung neu laden
                setTimeout(function () {
                    location.reload();
                }, 100);
            },
            error: function () {                        // Fehlerfall
                console.error('Fehler bei der Ajax-Anfrage.');
            }
        });
    });


    //Löschen von Tags mit Ajax
    // Klick-Event-Handler für die Löschen-Schaltflächen in der Tags-Liste
    $('body').on('click', '.tagsDelste', function () {
        // ID des zu löschenden Tags abrufen
        var tagsId = $(this).attr('data-tags-delete');

        // Ajax-Anfrage zum Löschen des Tags senden
        $.ajax({
            url: `/documents/delete/tags/${tagsId}/`,  // URL für das Löschen
            method: 'POST',                            // HTTP-Methode
            dataType: 'json',                          // erwarteter Datentyp der Antwort
            headers: {
                'X-CSRFToken': csrftoken               // CSRF-Token für die Sicherheit
            },
            success: function (data) {                  // Erfolgsfall
                // Die Seite nach einer kurzen Verzögerung neu laden
                setTimeout(function () {
                    location.reload();
                }, 100);
            },
            error: function () {                        // Fehlerfall
                console.error('Fehler bei der Ajax-Anfrage.');
            }
        });
    });

});