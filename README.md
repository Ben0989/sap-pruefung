# SAP Prüfungsgenerator

Statische Ausbilder-Anwendung für das Police Department Glendale. Veröffentlichung über GitHub Pages direkt aus `main` / Repository-Wurzel. Die Anwendung benötigt zur Laufzeit nur die sechs HTML-, CSS- und JavaScript-Dateien.

## Bedienung

1. Namen des Prüflings und des Prüfers eingeben, SAP starten.
2. Richtig genannte Antwortpunkte anhaken. Jeder Haken zählt einen Punkt. Vor-/Zurücknavigation erhält alle Bewertungen.
3. Auf der letzten Frage abschließen. Das vollständige Ergebnis mit allen Fragen, Bewertungen, Zeiten und fehlenden Antworten wird lokal gespeichert.
4. Im Archiv Prüfungen öffnen, wiederholen, löschen oder als JSON sichern. JSON-Sicherungen können auf einem anderen Gerät importiert werden.

Der aktuelle GitHub-Stand verwendet 20 zufällige Fragen aus 75 Fragen: Verstoß 5, RP13 4, Greenzones 2, Funkcodes 3, Korruption 2, Intern 2 und Dienstvorschriften 2. Dieser neuere Stand ersetzt die widersprüchliche ältere 15-Fragen-Anzeige. Die Fragen und Antworten aus dem Repository wurden inhaltlich nicht verändert.

Bestanden wird ab **exakt 80 %**; die Anzeige wird erst anschließend gerundet. Beispielsweise bleiben 51/64 Punkte (79,6875 %) nicht bestanden.

## Speicherung und Wiederherstellung

Ergebnisse liegen ausschließlich im lokalen Browserprofil, nicht im GitHub-Repository. Eine laufende Prüfung wird nach jeder Bewertung und Navigation zwischengespeichert und nach Neuladen wiederhergestellt. Bei gesperrtem oder vollem Speicher bleibt das Ergebnis auf der geöffneten Seite verfügbar; erneutes Speichern und JSON-Export sind möglich.

Das neue Archiv verwendet `sap_pruefung_archive_v3`, der Zwischenstand `sap_pruefung_draft_v3`. Die bisherigen Schlüssel `sap_exams` und `sap_pruefungen` werden beim ersten Schreiben übernommen; ihre Originaldaten bleiben erhalten. Alte Ergebnisse ohne Fragen-/Antwortdaten erscheinen in Gesamt- und Prüferstatistiken, jedoch nicht in Kategorie- und Fehlerquoten. Fehlende historische Einzelantworten können nicht rekonstruiert werden.

Beschädigte Archive werden nicht stillschweigend überschrieben. Die Oberfläche bietet Rohdatensicherung und ein ausdrücklich bestätigtes Zurücksetzen. Ergebnisse können anschließend erneut gespeichert werden. JSON-Sicherungen regelmäßig herunterladen, insbesondere vor einem Browser- oder Gerätewechsel.

## Statistik

Anzahl, bestanden/nicht bestanden, Bestehensquote, Durchschnittspunkte und Durchschnittsprozent; Kategorien nach erreichtem Anteil der möglichen Punkte; häufigste Fehlerfragen einschließlich Häufigkeit und fehlender Punkte; Prüferstatistik und letzte Prüfungen. Gelöschte Ergebnisse fallen aus allen Berechnungen heraus.

## Lokal ausführen und testen

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Für zuverlässige Browserspeicherung HTTP oder HTTPS verwenden.

```sh
npm install
npm test
npx playwright install chromium
npm run test:browser
```

Die Browsertests bedienen die Anwendung auf einem lokalen HTTP-Server unter einem Repository-Unterpfad. Sie prüfen vollständige Prüfungen, Wiederaufnahme, Archiv, Statistik, JSON-Dateien, Fehlerbehandlung und Layouts mit 320, 390, 768 und 1440 Pixeln Breite. Optional kann ein vorhandener Chromium-Browser mit `TEST_BROWSER_EXECUTABLE_PATH` angegeben werden. Screenshots werden nur lokal unter `test-results/` erzeugt.
