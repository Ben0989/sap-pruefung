# SAP Prüfungsgenerator

Mobile Ausbilder-Anwendung für das Police Department Glendale. GitHub Pages liefert die Oberfläche aus; Supabase Auth und die Edge Function `sap-generator-api` prüfen Anmeldungen und Berechtigungen und speichern den gemeinsamen Fragenkatalog.

## Anmeldung und Rollen

Der initial eingerichtete Benutzer heißt **Admin**. Sein Passwort wird ausschließlich bei Supabase Auth geprüft und steht nicht im Quellcode. Es gibt keine öffentliche Registrierung. Der Admin legt Lehrer über **Benutzer** an und kann deren Zugänge sperren, wieder freigeben und Passwörter zurücksetzen. Auch das eigene Adminpasswort kann dort geändert werden. Der Adminzugang kann nicht gesperrt werden.

Lehrer und Admin können unter **Fragen** alle aktiven Fragen durchsuchen, bearbeiten, löschen und neue Fragen anlegen. Die Eingabemaske enthält Kategorie, Frage, optionale Situation und erwartete Antwortpunkte. Eine Zeile entspricht einem Punkt. Änderungen gelten für neue Prüfungen; laufende und gespeicherte Prüfungen behalten ihre vollständige Momentaufnahme.

Nur der Admin sieht **Änderungen**: Bearbeiter, Zeitpunkt, Aktion und Vorher-/Nachher-Zustand. Änderungen können wiederhergestellt werden. Auch Wiederherstellungen werden protokolliert. Gelöschte Fragen bleiben dafür versioniert gespeichert. Veraltete Bearbeitungen werden mit einem Konflikt abgelehnt. Die Mindestzahl je Kategorie verhindert, dass nach dem Löschen keine Prüfungen mehr erzeugt werden können.

## Prüfungen

20 zufällige Fragen: Verstoß 5, RP13 4, Greenzones 2, Funkcodes 3, Korruption 2, Intern 2 und Dienstvorschriften 2. Jeder richtig genannte und angehakte Antwortpunkt zählt einen Punkt. Bestanden ab exakt **80 %**, ohne vorheriges Runden. Die 75 ursprünglichen Fragen wurden zentral übernommen.

**Ab Version 5 werden abgeschlossene SAPs und Zwischenstände ausschließlich in Supabase gespeichert.** Das gemeinsame Archiv und die Statistik sind nach Anmeldung auf allen Geräten verfügbar. Lehrer können eigene SAPs löschen, der Admin alle SAPs. Zwischenstände sind benutzerbezogen und können auf einem anderen Gerät fortgesetzt werden. Versionsprüfungen verhindern, dass ein älterer Prüfungsstand einen neueren überschreibt.

Beim Anmelden werden vorhandene Gerätearchive automatisch einmalig übernommen. Als Admin werden auf diesem Gerät auch die Archive der bisherigen Benutzer getrennt gelesen und übertragen; Lehrer übernehmen ihren eigenen bisherigen Bestand. Unzugeordnete ältere Archive übernimmt der Admin. Deshalb die neue Version einmal auf jedem bisherigen Gerät im ursprünglichen Browser als Admin öffnen. Auf Gerätedaten kann der Server erst nach diesem Seitenaufruf zugreifen.

Die ursprünglichen Daten werden erst nach bestätigter Übernahme entfernt. Fehlgeschlagene oder beschädigte Quellen bleiben erhalten; über **Alte Gerätedaten übernehmen** kann der Vorgang erneut gestartet werden. Serverseitige Abgleiche verhindern doppelte Einträge bei Wiederholungen oder einer unterbrochenen Antwort. Frühere lokale Sicherungsschlüssel werden berücksichtigt; ein vorhandenes neueres Gerätearchiv hat Vorrang vor dessen alten Sicherungskopien. Bereits zentral gelöschte SAPs werden durch alte Kopien nicht wiederhergestellt.

Es gibt keinen automatischen lokalen Speicherersatz für neue Prüfungen. Bei Verbindungsfehlern bleibt ein noch nicht bestätigtes Ergebnis geöffnet und ist ausdrücklich als ungespeichert gekennzeichnet. Erneutes Speichern und ein freiwilliger JSON-Export bleiben möglich. JSON-Importe speichern direkt zentral.

Die Statistik enthält Anzahl, Bestanden/Nicht bestanden, Bestehensquote, Durchschnitt, Kategorieauswertung, häufigste Fehlerfragen und Prüferwerte. Ältere Ergebnisse ohne vollständige Antworten werden nur in den berechenbaren Gesamt- und Prüferwerten berücksichtigt.

## Backend

`config.js` enthält ausschließlich Projektadresse und öffentlichen Publishable Key. `backend/index.ts` enthält die Edge Function, `backend/schema.sql` das ursprüngliche Schema und die Startbefüllung, `backend/cloud-exams.sql` die Erweiterung für zentrale Prüfungen und Entwürfe und `backend/exams.ts` deren serverseitige Validierung. `questions.js` bleibt als ursprünglicher Fragenbestand für Tests und Wiederherstellung im Repository; die Anwendung lädt Fragen nach Anmeldung ausschließlich vom Backend.

Dedizierte Tabellen: `sapg_users`, `sapg_questions`, `sapg_changes`, `sapg_exam_archive`, `sapg_exam_drafts`. RLS ist aktiviert und direkter Zugriff für `anon` und `authenticated` entzogen. Die Edge Function prüft bei jeder Anfrage Benutzer, aktive Rolle und die tatsächliche Auth-Sitzung. Ein ausschließlich für `service_role` zugänglicher RPC prüft Sitzungserstellung und Widerrufsgrenze; dadurch umgehen aufgefrischte Tokens weder eine Sperre noch einen Passwortwechsel. Rollen werden nicht aus editierbaren Nutzermetadaten abgeleitet.

Fragenänderungen und Änderungsprotokoll werden in derselben Datenbanktransaktion geschrieben. Die Dienstschlüssel bleiben ausschließlich in der Edge-Umgebung. `verify_jwt=false` ist erforderlich, weil die Funktion die Supabase-Auth-Prüfung selbst durchführt; geschützte Aktionen setzen immer eine gültige Sitzung voraus.

Die SQL-Dateien dokumentieren die bereits ausgeführten Migrationen und ist nicht für ein erneutes Anwenden auf dieselbe Datenbank bestimmt. Andere bestehende SAP-/BWG-Tabellen werden von dieser Anwendung nicht verändert.

## Tests

Node.js 24 oder neuer verwenden. Die Backend-Validierung wird in den Tests aus derselben TypeScript-Quelle geladen.

```sh
npm install
npm test
npx playwright install chromium
npm run test:browser
```

Die Browserregressionstests verwenden isolierte Auth-Fixtures. Der zusätzliche Integrationstest verwendet echte, dafür eingerichtete QA-Zugänge:

```sh
SAP_INTEGRATION_ADMIN_PASSWORD=... \
SAP_INTEGRATION_TEACHER_USERNAME=... \
SAP_INTEGRATION_TEACHER_PASSWORD=... \
npm run test:auth
```

Er startet einen lokalen HTTP-Server und prüft Anmeldung, Admin-Benutzeranlage, Lehrerrechte, Fragenmasken, Änderungsprotokoll, Wiederherstellung sowie Abmelden/Wiederaufnahme. Dabei werden QA-Datensätze erzeugt, die anschließend gezielt zu entfernen sind. Niemals Zugangsdaten committen. Screenshots liegen lokal unter `test-results/` und werden nicht versioniert. Ein vorhandener Chromium-Browser kann über `TEST_BROWSER_EXECUTABLE_PATH` angegeben werden.

Der Integrationstest für die zentrale Ergebnisspeicherung verwendet einen eigenen QA-Lehrer und prüft echte lokale Übernahme, eine neue vollständige Prüfung und den Zugriff aus einem zweiten Browser:

```sh
SAP_CLOUD_USERNAME=... SAP_CLOUD_PASSWORD=... SAP_CLOUD_USER_ID=... npm run test:cloud
```

Er löscht ausschließlich seine selbst erzeugten Test-SAPs über die normale API. Die automatisierten Kern- und Browserprüfungen decken unter anderem Teilübertragungen, verlorene Antworten, fehlerhafte Gerätedaten, Wiederholungen, Gerätewechsel, zentrale Statistik und gleichzeitige Entwurfsänderungen ab.
