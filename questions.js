const questions = [

/* =========================
   VERSTOSSKATEGORIEN
========================= */

{
    id: "VK-1",
    category: "Verstoß",
    question: "Welche Verstoßkategorien gibt es und wie lange gelten sie?",
    answers: [
        "Strafrecht → 20 Minuten",
        "Zivilrecht → 10 Minuten",
        "Ordnungswidrigkeiten → 5 Minuten"
    ]
},

/* =========================
   VERSTOSS STRAFRECHTLICHE
========================= */

{
    id: "1.1",
    category: "Verstoß",
    question: "Wann wird Verstoß 1.1 vergeben?",
    answers: [
        "Staatliche Einrichtungen",
        "Gewaltsame Einnahme",
        "Bewaffnete Besetzung"
    ]
},

{
    id: "1.2",
    category: "Verstoß",
    question: "Was versteht man unter einer Machtübernahme durch Gewalt?",
    answers: [
        "Kontrolle oder Entscheidungen erzwingen",
        "Anwendung von Gewalt",
        "Bewaffnetes Vorgehen"
    ]
},

{
    id: "1.3",
    category: "Verstoß",
    question: "Wann liegt eine Geiselnahme vor?",
    answers: [
        "Person wird festgehalten",
        "Person wird verschleppt",
        "Gegen den eigenen Willen"
    ]
},

{
    id: "1.4",
    category: "Verstoß",
    question: "Wann wird Verstoß 1.4 vergeben?",
    answers: [
        "Fahrzeug",
        "Fußgänger",
        "Tödlich verletzt"
    ]
},

{
    id: "1.5",
    category: "Verstoß",
    question: "Wann liegt ein versuchter Diebstahl vor?",
    answers: [
        "Versuch",
        "Fremde Sache",
        "Wegnahme"
    ]
},

{
    id: "1.6",
    category: "Verstoß",
    question: "Wann liegt ein Überfall auf einen Polizeibeamten vor?",
    answers: [
        "Polizeibeamter",
        "Gewalt oder Drohung",
        "Herausgabe von Eigentum oder Informationen"
    ]
},

{
    id: "1.7",
    category: "Verstoß",
    question: "Wann liegt ein Verstoß gegen 1.7 vor?",
    answers: [
        "Geschützten Bereich betreten",
        "Unbefugt",
        "Aufforderung zum Verlassen wird ignoriert"
    ]
},

{
    id: "1.8",
    category: "Verstoß",
    question: "Wann wird Verstoß 1.8 vergeben?",
    answers: [
        "Fahrzeug",
        "Fußgänger angefahren",
        "Nicht tödlich"
    ]
},

{
    id: "1.9",
    category: "Verstoß",
    question: "Wann liegt Verstoß 1.9 vor?",
    answers: [
        "Schussabgabe",
        "Öffentlicher Ort"
    ]
},

{
    id: "1.10",
    category: "Verstoß",
    question: "Was versteht man unter Bestechung eines Polizeibeamten?",
    answers: [
        "Geld oder Vorteil anbieten",
        "Polizeibeamter",
        "Verletzung dienstlicher Pflichten"
    ]
},
/* =========================
   VERSTOSS ZIVILRECHTLICHE
========================= */

{
    id: "2.1",
    category: "Verstoß",
    question: "Wann wird Verstoß 2.1 vergeben?",
    answers: [
        "Staatliches Eigentum",
        "Vorsätzliche Beschädigung",
        "Oder Zerstörung"
    ]
},

{
    id: "2.2",
    category: "Verstoß",
    question: "Wann liegt Verstoß 2.2 vor?",
    answers: [
        "Privateigentum",
        "Vorsätzliche Beschädigung",
        "Oder Zerstörung"
    ]
},

{
    id: "2.3",
    category: "Verstoß",
    question: "Wann liegt ein falscher Notruf vor?",
    answers: [
        "Bewusst ausgelöst",
        "Kein tatsächlicher Notfall"
    ]
},

{
    id: "2.4",
    category: "Verstoß",
    question: "Was versteht man unter Ausschweifungen?",
    answers: [
        "Erhebliche Störung der Öffentlichkeit",
        "Lärmbelästigung",
        "Vergleichbare störende Handlungen"
    ]
},

{
    id: "2.5",
    category: "Verstoß",
    question: "Was ist der Unterschied zwischen Morddrohung, versuchtem Mord und Mord?",
    answers: [
        "Morddrohung = Androhung einer Tötung",
        "Versuchter Mord = Tötungsversuch ohne Erfolg",
        "Mord = vorsätzliche vollendete Tötung"
    ]
},

{
    id: "2.6",
    category: "Verstoß",
    question: "Wann liegt eine Beleidigung eines Staatsbediensteten vor?",
    answers: [
        "Staatsbediensteter",
        "Ehrverletzende Aussage",
        "Beleidigende Aussage"
    ]
},

{
    id: "2.7",
    category: "Verstoß",
    question: "Was versteht man unter Erpressung?",
    answers: [
        "Gewalt oder Drohung",
        "Handlung erzwingen",
        "Geld oder Gegenstände verlangen"
    ]
},

/* =========================
   VERSTOSS ORDNUNGSWIDRIGKEITEN
========================= */

{
    id: "3.1",
    category: "Verstoß",
    question: "Wann liegt Widerstand gegen die Festnahme vor?",
    answers: [
        "Rechtmäßige Festnahme",
        "Aktiver Widerstand",
        "Oder gegen die Fesselung"
    ]
},

{
    id: "3.2",
    category: "Verstoß",
    question: "Wann liegt Ungehorsam gegenüber einem Polizeibeamten vor?",
    answers: [
        "Rechtmäßige Anweisung",
        "Bewusst nicht befolgt"
    ]
},

{
    id: "3.3",
    category: "Verstoß",
    question: "Wann liegt Beihilfe zum Widerstand gegen die Festnahme vor?",
    answers: [
        "Festgenommenen unterstützen",
        "Flucht ermöglichen",
        "Festnahme verhindern"
    ]
},

{
    id: "3.4",
    category: "Verstoß",
    question: "Wann liegt ein Verstoß gegen die Verkehrsregeln vor?",
    answers: [
        "Verkehrsteilnehmer",
        "Verstoß gegen Verkehrsregeln"
    ]
},

{
    id: "3.5",
    category: "Verstoß",
    question: "Wann wird Verstoß 3.5 vergeben?",
    answers: [
        "Zivilperson",
        "Vorsätzlicher körperlicher Angriff"
    ]
},

{
    id: "3.6",
    category: "Verstoß",
    question: "Wann liegt Verstoß 3.6 vor?",
    answers: [
        "Rechtmäßige Aufforderung",
        "Dokumente nicht vorgelegt"
    ]
},
/* =========================
   RP13
========================= */

{
    id: "RP13-1",
    category: "RP13",
    question: "Was versteht man unter RP13?",
    answers: [
        "Sanktion wegen Fail-RP",
        "Schwerwiegendes Fehlverhalten",
        "Staatsbediensteter"
    ]
},

{
    id: "RP13-2",
    category: "RP13",
    question: "Wer kann RP13 erhalten?",
    answers: [
        "PD",
        "MD",
        "Army"
    ]
},

{
    id: "RP13-3",
    category: "RP13",
    question: "Welches Strafmaß kann RP13 nach sich ziehen?",
    answers: [
        "1–3 Tage Bann",
        "30–90 Minuten Haft",
        "Schriftliche oder mündliche Verwarnung",
        "Kündigung nach BG-Entscheidung"
    ]
},

{
    id: "RP13-4",
    category: "RP13",
    question: "Welche Verstöße darf ein Polizeibeamter niemals vergeben?",
    answers: [
        "Verstoß 1.11",
        "Verstoß 1.12",
        "Nur das System vergibt diese"
    ]
},

{
    id: "RP13-5",
    category: "RP13",
    question: "Warum dürfen Polizeibeamte diese Verstöße nicht vergeben?",
    answers: [
        "Systemseitige Vergabe",
        "Nicht Zuständigkeit der Polizei"
    ]
},

{
    id: "RP13-6",
    category: "RP13",
    situation: "Während einer Festnahme vergibt ein Officer eigenständig Verstoß 1.11, obwohl dieser ausschließlich vom System vergeben werden darf.",
    question: "Wie bewertest du das Verhalten des Officers?",
    answers: [
        "Officer handelt fehlerhaft",
        "1.11 darf nur vom System vergeben werden",
        "Kann RP13 darstellen"
    ]
},

{
    id: "RP13-7",
    category: "RP13",
    situation: "Ein Officer erschießt einen unbewaffneten Bürger ohne rechtliche Grundlage oder unmittelbare Gefahr.",
    question: "Wie ist die Situation zu bewerten?",
    answers: [
        "Schwerwiegendes Fail-RP",
        "RP13 möglich"
    ]
},
/* =========================
   GREENZONES
========================= */

{
    id: "GZ-1",
    category: "Greenzones",
    question: "Was ist eine Greenzone?",
    answers: [
        "Besonders geschützter Bereich",
        "Keine Kampfhandlungen erlaubt"
    ]
},

{
    id: "GZ-2",
    category: "Greenzones",
    question: "Nenne alle Greenzones.",
    answers: [
        "PD",
        "Krankenhaus",
        "Army-Lazarett",
        "Wohnung",
        "Kirche",
        "Kleidungsladen Hills",
        "Trade",
        "GH1-7",
        "Bar",
        "Theater",
        "Premium-Händler (innen)",
        "Mine",
        "Holzfäller",
        "Rathaus",
        "Pier",
        "Casino"
    ]
},

{
    id: "GZ-3",
    category: "Greenzones",
    question: "Welche Handlungen sind in einer Greenzone verboten?",
    answers: [
        "Schießen",
        "Töten",
        "Körperliche Angriffe",
        "Bedrohungen",
        "Hineinschießen",
        "Herausschießen",
        "Vor laufendem RP verstecken"
    ]
},

{
    id: "GZ-4",
    category: "Greenzones",
    question: "Darf eine Greenzone genutzt werden, um sich einer Festnahme zu entziehen?",
    answers: [
        "Nein",
        "Nicht zum Entziehen einer Festnahme",
        "Nicht zum Entziehen eines laufenden RP"
    ]
},

{
    id: "GZ-5",
    category: "Greenzones",
    question: "Darf in einer Greenzone ein Feuergefecht stattfinden?",
    answers: [
        "Nein"
    ]
},

{
    id: "GZ-6",
    category: "Greenzones",
    question: "Darf aus einer Greenzone heraus oder in eine Greenzone hineingeschossen werden?",
    answers: [
        "Nein",
        "Hineinschießen verboten",
        "Herausschießen verboten"
    ]
},

{
    id: "GZ-7",
    category: "Greenzones",
    situation: "Kurz vor einem Army-Event greift eine Gruppe das Lazarett an.",
    question: "Ist das zulässig?",
    answers: [
        "Nein",
        "Army-Lazarett ist Greenzone",
        "15 Minuten vor dem Event geschützt",
        "15 Minuten nach dem Event geschützt"
    ]
},

{
    id: "GZ-8",
    category: "Greenzones",
    situation: "Ein Täter flüchtet nach einem Raub in die Kirche und bleibt dort, um der Polizei zu entkommen.",
    question: "Wie bewertest du die Situation?",
    answers: [
        "Kirche ist Greenzone",
        "Nicht zum Verstecken nutzen",
        "Laufendes RP darf nicht umgangen werden"
    ]
},
/* =========================
   FUNKCODES
========================= */

{
    id: "FK-1",
    category: "Funkcodes",
    question: "Wann wird 10.03 verwendet?",
    answers: [
        "Funkspruch wiederholen",
        "Funkspruch unverständlich"
    ]
},

{
    id: "FK-2",
    category: "Funkcodes",
    question: "Was bedeutet 10.04?",
    answers: [
        "Funkspruch verstanden"
    ]
},

{
    id: "FK-3",
    category: "Funkcodes",
    question: "Was bedeutet 10.06?",
    answers: [
        "Negativ"
    ]
},

{
    id: "FK-4",
    category: "Funkcodes",
    question: "Welche Information gehört immer zu 10.10?",
    answers: [
        "10.20",
        "Aktueller Standort"
    ]
},

{
    id: "FK-5",
    category: "Funkcodes",
    question: "Was bedeutet 10.20?",
    answers: [
        "Aktueller Standort"
    ]
},

{
    id: "FK-6",
    category: "Funkcodes",
    question: "Was bedeutet 10.26?",
    answers: [
        "Verkehrskontrolle",
        "Beschreibung",
        "10.20"
    ]
},

{
    id: "FK-7",
    category: "Funkcodes",
    question: "Was bedeutet 10.30?",
    answers: [
        "Pause"
    ]
},

{
    id: "FK-8",
    category: "Funkcodes",
    question: "Was bedeutet 10.60?",
    answers: [
        "Verfolgungsjagd",
        "Beifahrer Funkt",
        "10.20",
        "alle 20/30 Sekunden neuer 10.20"
    ]
},

{
    id: "FK-9",
    category: "Funkcodes",
    question: "Was bedeutet 10.80?",
    answers: [
        "PD-Fahrzeug benötigt",
        "10.20"
    ]
},

{
    id: "FK-10",
    category: "Funkcodes",
    question: "Wann wird 10.99 verwendet?",
    answers: [
        "Officer verletzt",
        "Officer in unmittelbarer Gefahr"
        "10.20"
    ]
},

{
    id: "FK-11",
    category: "Funkcodes",
    question: "Was bedeutet Code 3?",
    answers: [
        "Anfahrt des Einsatzes",
        "mit Sondersignal"
    ]
},

{
    id: "FK-12",
    category: "Funkcodes",
    question: "Was bedeutet Code 4?",
    answers: [
        "Lage unter Kontrolle",
        "Keine weiteren Kräfte erforderlich"
    ]
},

{
    id: "FK-13",
    category: "Funkcodes",
    question: "Was bedeutet Code 6?",
    answers: [
        "Fußstreife",
        "10.20"
    ]
},

/* =========================
   FUNKCODES - SITUATIONEN
========================= */

{
    id: "FK-S1",
    category: "Funkcodes",
    situation: "Du beginnst eine Verkehrskontrolle.",
    question: "Welcher Funkcode wird verwendet und welche Informationen müssen übermittelt werden?",
    answers: [
        "10.26",
        "10.20 (Standort)",
        "Fahrzeugbeschreibung"
    ]
},

{
    id: "FK-S2",
    category: "Funkcodes",
    situation: "Ein Fahrzeug flüchtet vor der Polizei.",
    question: "Welcher Funkcode wird verwendet?",
    answers: [
        "10.60",
        "10.20 alle 20/30 Sekunden",
        "Fahrzeugbeschreibung",
        "Beifahrer übernimmt den Funk"
    ]
},

{
    id: "FK-S3",
    category: "Funkcodes",
    situation: "Während einer Schießerei wird ein Officer getroffen.",
    question: "Welcher Funkcode ist abzusetzen?",
    answers: [
        "10.99",
        "10.20"
    ]
},

{
    id: "FK-S4",
    category: "Funkcodes",
    situation: "Alle Täter wurden festgenommen. Weitere Unterstützung ist nicht erforderlich.",
    question: "Welcher Code wird gefunkt?",
    answers: [
        "Code 4"
    ]
},
/* =========================
   KORRUPTION
========================= */

{
    id: "K-1",
    category: "Korruption",
    question: "Wie ist die Einstellung der Staatsfraktionen gegenüber Korruption?",
    answers: [
        "Korruption wird nicht geduldet",
        "Korruption wird konsequent verfolgt"
    ]
},

{
    id: "K-2",
    category: "Korruption",
    question: "Was versteht man unter Korruption?",
    answers: [
        "Missbrauch der dienstlichen Stellung",
        "Annahme oder Forderung von Vorteilen",
        "Beeinflussung dienstlicher Entscheidungen"
    ]
},

{
    id: "K-3",
    category: "Korruption",
    question: "Wie verhältst du dich, wenn dir ein Bürger Geld anbietet, damit du ihn laufen lässt?",
    answers: [
        "Angebot ablehnen",
        "Keine Gegenleistung annehmen",
        "Vorfall dokumentieren",
        "Vorgesetzten informieren"
    ]
},

{
    id: "K-4",
    category: "Korruption",
    situation: "Während einer Verkehrskontrolle bietet dir ein Fahrer 100.000 $, damit du kein Bußgeld ausstellst.",
    question: "Wie reagierst du?",
    answers: [
        "Angebot ablehnen",
        "Kein Geld annehmen",
        "Fall nach Vorschrift bearbeiten"
    ]
},

{
    id: "K-5",
    category: "Korruption",
    situation: "Ein Officer lässt einen Täter gegen Zahlung von Geld frei.",
    question: "Wie ist das zu bewerten?",
    answers: [
        "Korruption",
        "Schwerer Dienstverstoß"
    ]
},

{
    id: "K-6",
    category: "Korruption",
    situation: "Ein Beamter verrät gegen Bezahlung den Standort einer Polizeikontrolle.",
    question: "Wie bewertest du dieses Verhalten?",
    answers: [
        "Korruption",
        "Dienstliche Informationen weitergegeben",
        "Unzulässig"
    ]
},

/* =========================
   INTERN
========================= */

{
    id: "I-1",
    category: "Intern",
    question: "Was bedeutet der Begriff 'intern'?",
    answers: [
        "Nur innerhalb der Fraktion",
        "Keine Weitergabe an Außenstehende"
    ]
},

{
    id: "I-2",
    category: "Intern",
    question: "Warum dürfen interne Informationen nicht weitergegeben werden?",
    answers: [
        "Nur für die Fraktion bestimmt",
        "Schutz laufender Einsätze",
        "Schutz laufender Ermittlungen"
    ]
},

{
    id: "I-3",
    category: "Intern",
    situation: "Ein befreundeter Zivilist fragt dich nach dem aktuellen Standort einer laufenden Polizeiaktion.",
    question: "Wie verhältst du dich?",
    answers: [
        "Keine Informationen weitergeben",
        "Informationen sind intern"
    ]
},

{
    id: "I-4",
    category: "Intern",
    situation: "Ein Beamter veröffentlicht interne Einsatzinformationen auf einem öffentlichen Discord-Server.",
    question: "Wie ist dies zu bewerten?",
    answers: [
        "Verstoß gegen Vertraulichkeit",
        "Interne Informationen veröffentlicht"
    ]
},

/* =========================
   DIENSTVORSCHRIFTEN
========================= */

{
    id: "DV-1",
    category: "Dienstvorschriften",
    question: "Wie sollte sich ein Polizeibeamter im Dienst verhalten?",
    answers: [
        "Professionell",
        "Respektvoll",
        "Dienstvorschriften einhalten",
        "RP-Regeln einhalten"
    ]
},

{
    id: "DV-2",
    category: "Dienstvorschriften",
    question: "Was bedeutet Verhältnismäßigkeit?",
    answers: [
        "Erforderliche Maßnahmen",
        "Angemessene Maßnahmen"
    ]
},

{
    id: "DV-3",
    category: "Dienstvorschriften",
    situation: "Ein Bürger bleibt nach einer Verkehrskontrolle ruhig stehen und kooperiert vollständig.",
    question: "Darf sofort der Taser eingesetzt werden?",
    answers: [
        "Nein",
        "Keine Gefahr",
        "Bürger kooperiert",
        "Taser wäre unverhältnismäßig"
    ]
},

{
    id: "DV-4",
    category: "Dienstvorschriften",
    question: "Wie sollte die Kommunikation eines Officers erfolgen?",
    answers: [
        "Ruhig",
        "Höflich",
        "Professionell",
        "Eindeutig"
    ]
},

{
    id: "DV-5",
    category: "Dienstvorschriften",
    situation: "Ein Officer fordert Unterstützung an.",
    question: "Wie verhältst du dich?",
    answers: [
        "Unterstützen wenn verfügbar",
        "Über Funk bestätigen"
    ]
},

{
    id: "DV-6",
    category: "Dienstvorschriften",
    question: "Welche Auswirkungen hat genehmigter Urlaub?",
    answers: [
        "Keine Verpflichtung zur Dienstausübung"
    ]
},

{
    id: "DV-7",
    category: "Dienstvorschriften",
    situation: "Ein Beamter befindet sich im Urlaub und wird zu einem Einsatz aufgefordert.",
    question: "Wie ist die Situation zu bewerten?",
    answers: [
        "Keine Dienstpflicht",
        "Ausnahmen nach Fraktionsregelung"
    ]
},

{
    id: "DV-8",
    category: "Dienstvorschriften",
    situation: "Mehrere bewaffnete Täter flüchten mit einem Fahrzeug.",
    question: "Welche ersten Maßnahmen sind einzuleiten?",
    answers: [
        "Lage beurteilen",
        "Funk absetzen",
        "Verstärkung anfordern",
        "Verfolgung aufnehmen",
        "Eigensicherung beachten"
    ]
},

{
    id: "DV-9",
    category: "Dienstvorschriften",
    situation: "Ein Bürger verhält sich aggressiv, greift jedoch niemanden an.",
    question: "Wie gehst du vor?",
    answers: [
        "Ruhig bleiben",
        "Kommunikation suchen",
        "Deeskalieren",
        "Zwangsmittel nur bei tatsächlicher Gefahr"
    ]
}

];
