const questions = [

/* =========================
   VERSTOSSKATEGORIEN
========================= */

{
    id: "VK-1",
    category: "Verstoß",
    question: "Welche Verstoßkategorien gibt es und wie lange gelten sie?",
    answer: "• Strafrecht → 20 Minuten\n• Zivilrecht → 10 Minuten\n• Ordnungswidrigkeiten → 5 Minuten",
    points: 3
},

/* =========================
   VERSTOSS 1.1
========================= */

{
    id: "1.1",
    category: "Verstoß",
    question: "Wann wird Verstoß 1.1 vergeben?",
    answer: "Wenn staatliche Einrichtungen gewaltsam oder bewaffnet eingenommen oder besetzt werden sollen.",
    points: 1
},

/* =========================
   VERSTOSS 1.2
========================= */

{
    id: "1.2",
    category: "Verstoß",
    question: "Was versteht man unter einer Machtübernahme durch Gewalt?",
    answer: "Der Versuch, Entscheidungen oder Kontrolle durch Gewalt oder bewaffnetes Vorgehen zu erzwingen.",
    points: 1
},

/* =========================
   VERSTOSS 1.3
========================= */

{
    id: "1.3",
    category: "Verstoß",
    question: "Wann liegt eine Geiselnahme vor?",
    answer: "Wenn Personen gegen ihren Willen festgehalten oder verschleppt werden.",
    points: 1
},

/* =========================
   VERSTOSS 1.4
========================= */

{
    id: "1.4",
    category: "Verstoß",
    question: "Wann wird Verstoß 1.4 vergeben?",
    answer: "Wenn ein Fahrzeug einen Fußgänger tödlich verletzt.",
    points: 1
},

/* =========================
   VERSTOSS 1.5
========================= */

{
    id: "1.5",
    category: "Verstoß",
    question: "Wann liegt ein versuchter Diebstahl vor?",
    answer: "Bereits der Versuch, eine fremde Sache wegzunehmen, erfüllt den Tatbestand.",
    points: 1
},

/* =========================
   VERSTOSS 1.6
========================= */

{
    id: "1.6",
    category: "Verstoß",
    question: "Wann liegt ein Überfall auf einen Polizeibeamten vor?",
    answer: "Wenn ein Polizeibeamter durch Gewalt oder Drohung zur Herausgabe von Eigentum oder Informationen gezwungen wird.",
    points: 1
},

/* =========================
   VERSTOSS 1.7
========================= */

{
    id: "1.7",
    category: "Verstoß",
    question: "Wann liegt ein Verstoß gegen 1.7 vor?",
    answer: "Ein Verstoß liegt vor, wenn eine Person einen geschützten Bereich unbefugt betritt und einer rechtmäßigen Aufforderung zum Verlassen nicht nachkommt.",
    points: 1
},

/* =========================
   VERSTOSS 1.8
========================= */

{
    id: "1.8",
    category: "Verstoß",
    question: "Wann wird Verstoß 1.8 vergeben?",
    answer: "Wenn ein Fahrzeug einen Fußgänger anfährt oder überfährt, dieser jedoch nicht verstirbt.",
    points: 1
},

/* =========================
   VERSTOSS 1.9
========================= */

{
    id: "1.9",
    category: "Verstoß",
    question: "Wann liegt Verstoß 1.9 vor?",
    answer: "Bereits das Abgeben eines Schusses an einem öffentlichen Ort erfüllt den Tatbestand.",
    points: 1
},

/* =========================
   VERSTOSS 1.10
========================= */

{
    id: "1.10",
    category: "Verstoß",
    question: "Was versteht man unter Bestechung eines Polizeibeamten?",
    answer: "Bestechung liegt vor, wenn einem Polizeibeamten Geld oder ein anderer Vorteil angeboten wird, damit dieser seine dienstlichen Pflichten verletzt.",
    points: 1
},

/* =========================
   VERSTOSS 2.1
========================= */

{
    id: "2.1",
    category: "Verstoß",
    question: "Wann wird Verstoß 2.1 vergeben?",
    answer: "Wenn staatliches Eigentum vorsätzlich beschädigt oder zerstört wird.",
    points: 1
},

/* =========================
   VERSTOSS 2.2
========================= */

{
    id: "2.2",
    category: "Verstoß",
    question: "Wann liegt Verstoß 2.2 vor?",
    answer: "Wenn fremdes Privateigentum absichtlich beschädigt oder zerstört wird.",
    points: 1
},

/* =========================
   VERSTOSS 2.3
========================= */

{
    id: "2.3",
    category: "Verstoß",
    question: "Wann liegt ein falscher Notruf vor?",
    answer: "Wenn bewusst ein Notruf ohne tatsächlichen Notfall ausgelöst wird.",
    points: 1
},

/* =========================
   VERSTOSS 2.4
========================= */

{
    id: "2.4",
    category: "Verstoß",
    question: "Was versteht man unter Ausschweifungen?",
    answer: "Eine erhebliche Störung der Öffentlichkeit, etwa durch dauerhaftes Lärmen oder vergleichbare Handlungen.",
    points: 1
},

/* =========================
   VERSTOSS 2.5
========================= */

{
    id: "2.5",
    category: "Verstoß",
    question: "Was ist der Unterschied zwischen Morddrohung, versuchtem Mord und Mord?",
    answer: "• Morddrohung = Androhung einer Tötung.\n• Versuchter Mord = Tötungsversuch ohne Erfolg.\n• Mord = vorsätzliche vollendete Tötung.",
    points: 1
},

/* =========================
   VERSTOSS 2.6
========================= */

{
    id: "2.6",
    category: "Verstoß",
    question: "Wann liegt eine Beleidigung eines Staatsbediensteten vor?",
    answer: "Wenn ein Staatsbediensteter durch ehrverletzende oder beleidigende Aussagen in seiner Person angegriffen wird.",
    points: 1
},

/* =========================
   VERSTOSS 2.7
========================= */

{
    id: "2.7",
    category: "Verstoß",
    question: "Was versteht man unter Erpressung?",
    answer: "Erpressung ist das Erzwingen einer Handlung oder der Herausgabe von Geld oder Gegenständen durch Gewalt oder Drohung.",
    points: 1
},

/* =========================
   VERSTOSS 3.1
========================= */

{
    id: "3.1",
    category: "Verstoß",
    question: "Wann liegt Widerstand gegen die Festnahme vor?",
    answer: "Wenn sich eine Person aktiv gegen eine rechtmäßige Festnahme oder Fesselung widersetzt.",
    points: 1
},

/* =========================
   VERSTOSS 3.2
========================= */

{
    id: "3.2",
    category: "Verstoß",
    question: "Wann liegt Ungehorsam gegenüber einem Polizeibeamten vor?",
    answer: "Wenn rechtmäßige Anweisungen eines Polizeibeamten bewusst nicht befolgt werden.",
    points: 1
},

/* =========================
   VERSTOSS 3.3
========================= */

{
    id: "3.3",
    category: "Verstoß",
    question: "Wann liegt Beihilfe zum Widerstand gegen die Festnahme vor?",
    answer: "Wenn eine Person einen Festgenommenen unterstützt, damit dieser einer Festnahme entgehen kann.",
    points: 1
},

/* =========================
   VERSTOSS 3.4
========================= */

{
    id: "3.4",
    category: "Verstoß",
    question: "Wann liegt ein Verstoß gegen die Verkehrsregeln vor?",
    answer: "Wenn ein Verkehrsteilnehmer gegen geltende Verkehrsregeln verstößt.",
    points: 1
},

/* =========================
   VERSTOSS 3.5
========================= */

{
    id: "3.5",
    category: "Verstoß",
    question: "Wann wird Verstoß 3.5 vergeben?",
    answer: "Wenn eine Zivilperson vorsätzlich körperlich angegriffen wird.",
    points: 1
},

/* =========================
   VERSTOSS 3.6
========================= */

{
    id: "3.6",
    category: "Verstoß",
    question: "Wann liegt Verstoß 3.6 vor?",
    answer: "Wenn angeforderte Dokumente trotz rechtmäßiger Aufforderung nicht vorgelegt werden.",
    points: 1
},

/* =========================
   RP13
========================= */

{
    id: "RP13-1",
    category: "RP13",
    question: "Was versteht man unter RP13?",
    answer: "RP13 ist eine Sanktion wegen Fail-RP oder schwerwiegendem Fehlverhalten eines Staatsbediensteten.",
    points: 1
},

{
    id: "RP13-2",
    category: "RP13",
    question: "Wer kann RP13 erhalten?",
    answer: "RP13 kann ausschließlich gegen Angehörige der Staatsfraktionen ausgesprochen werden:\n• PD\n• MD\n• Army",
    points: 1
},

{
    id: "RP13-3",
    category: "RP13",
    question: "Welches Strafmaß kann RP13 nach sich ziehen?",
    answer: "• 1–3 Tage Bann\n• 30–90 Minuten Haft\n• schriftliche oder mündliche Verwarnung\n• Kündigung nach Entscheidung des BG",
    points: 1
},

{
    id: "RP13-4",
    category: "RP13",
    question: "Welche Verstöße darf ein Polizeibeamter niemals vergeben?",
    answer: "Die Verstöße 1.11 und 1.12, da diese ausschließlich durch das System bzw. den Staat vergeben werden.",
    points: 2
},

{
    id: "RP13-5",
    category: "RP13",
    question: "Warum dürfen Polizeibeamte diese Verstöße nicht vergeben?",
    answer: "Weil diese Verstöße systemseitig vergeben werden und nicht im Zuständigkeitsbereich der Polizei liegen.",
    points: 2
},

{
    id: "RP13-6",
    category: "RP13",
    question: "Wie bewertest du das Verhalten des Officers?",
    situation: "Während einer Festnahme vergibt ein Officer eigenständig Verstoß 1.11, obwohl dieser ausschließlich vom System vergeben werden darf.",
    answer: "Der Officer handelt fehlerhaft. Die Verstöße 1.11 und 1.12 dürfen ausschließlich durch das System vergeben werden. Das eigenständige Vergeben kann ein RP13-Verstoß sein.",
    points: 2
},

{
    id: "RP13-7",
    category: "RP13",
    question: "Wie ist die Situation zu bewerten?",
    situation: "Ein Officer erschießt einen unbewaffneten Bürger ohne rechtliche Grundlage oder unmittelbare Gefahr.",
    answer: "Das Verhalten stellt schwerwiegendes Fail-RP dar. Je nach Bewertung kann RP13 ausgesprochen werden.",
    points: 2
},

/* =========================
   GREENZONES
========================= */

{
    id: "GZ-1",
    category: "Greenzones",
    question: "Was ist eine Greenzone?",
    answer: "Eine Greenzone ist ein besonders geschützter Bereich, in dem grundsätzlich keine Kampfhandlungen stattfinden dürfen.",
    points: 1
},

{
    id: "GZ-2",
    category: "Greenzones",
    question: "Nenne alle Greenzones.",
    answer: "PD, Krankenhaus, Army-Lazarett, Wohnung, Kirche, Kleidungsladen Hills, Trade, GH1, GH2, GH3, GH4, GH5, GH6, GH7, Bar, Theater, Premium-Händler (innen), Mine, Holzfäller, Rathaus, Pier, Casino.",
    points: 16
},

{
    id: "GZ-3",
    category: "Greenzones",
    question: "Welche Handlungen sind in einer Greenzone verboten?",
    answer: "Schießen, Töten, körperliche Angriffe, Bedrohungen, Hinein- oder Herausschießen sowie das Verstecken vor einem laufenden RP.",
    points: 1
},

{
    id: "GZ-4",
    category: "Greenzones",
    question: "Darf eine Greenzone genutzt werden, um sich einer Festnahme zu entziehen?",
    answer: "Nein. Greenzones dürfen nicht genutzt werden, um sich einem laufenden RP oder einer Festnahme zu entziehen.",
    points: 1
},

{
    id: "GZ-5",
    category: "Greenzones",
    question: "Darf in einer Greenzone ein Feuergefecht stattfinden?",
    answer: "Nein. Feuergefechte sind innerhalb einer Greenzone verboten.",
    points: 1
},

{
    id: "GZ-6",
    category: "Greenzones",
    question: "Darf aus einer Greenzone heraus oder in eine Greenzone hineingeschossen werden?",
    answer: "Nein. Sowohl das Hineinschießen als auch das Herausschießen ist verboten.",
    points: 1
},

{
    id: "GZ-7",
    category: "Greenzones",
    question: "Ist das zulässig?",
    situation: "Kurz vor einem Army-Event greift eine Gruppe das Lazarett an.",
    answer: "Nein. Das Army-Lazarett steht 15 Minuten vor und 15 Minuten nach einem Event unter Greenzone-Schutz. Während dieser Zeit sind Angriffe unzulässig.",
    points: 1
},

{
    id: "GZ-8",
    category: "Greenzones",
    question: "Wie bewertest du die Situation?",
    situation: "Ein Täter flüchtet nach einem Raub in die Kirche und bleibt dort, um der Polizei zu entkommen.",
    answer: "Die Kirche ist eine Greenzone. Das Verstecken in einer Greenzone, um einem laufenden RP zu entgehen, ist nicht erlaubt.",
    points: 1
},

/* =========================
   FUNKCODES
========================= */

{
    id: "FK-1",
    category: "Funkcodes",
    question: "Wann wird 10.03 verwendet?",
    answer: "Wenn ein Funkspruch wiederholt werden soll, weil er nicht verständlich war.",
    points: 1
},

{
    id: "FK-2",
    category: "Funkcodes",
    question: "Was bedeutet 10.04?",
    answer: "Der Funkspruch wurde verstanden.",
    points: 1
},

{
    id: "FK-3",
    category: "Funkcodes",
    question: "Was bedeutet 10.06?",
    answer: "Negativ.",
    points: 1
},

{
    id: "FK-4",
    category: "Funkcodes",
    question: "Welche Information gehört immer zu 10.10?",
    answer: "Der aktuelle Standort (10.20).",
    points: 1
},

{
    id: "FK-5",
    category: "Funkcodes",
    question: "Was bedeutet 10.20?",
    answer: "Aktueller Standort.",
    points: 1
},

{
    id: "FK-6",
    category: "Funkcodes",
    question: "Was bedeutet 10.26?",
    answer: "Verkehrskontrolle.",
    points: 1
},

{
    id: "FK-7",
    category: "Funkcodes",
    question: "Was bedeutet 10.30?",
    answer: "Pause.",
    points: 1
},

{
    id: "FK-8",
    category: "Funkcodes",
    question: "Was bedeutet 10.60?",
    answer: "Verfolgungsjagd.",
    points: 1
},

{
    id: "FK-9",
    category: "Funkcodes",
    question: "Was bedeutet 10.80?",
    answer: "Benötige PD-Fahrzeug.",
    points: 1
},

{
    id: "FK-10",
    category: "Funkcodes",
    question: "Wann wird 10.99 verwendet?",
    answer: "Wenn ein Officer verletzt wurde oder sich unmittelbar in Gefahr befindet.",
    points: 1
},

{
    id: "FK-11",
    category: "Funkcodes",
    question: "Was bedeutet Code 3?",
    answer: "Der Einsatz wird mit Sonder- und Wegerechten angefahren.",
    points: 1
},

{
    id: "FK-12",
    category: "Funkcodes",
    question: "Was bedeutet Code 4?",
    answer: "Der Einsatz ist unter Kontrolle und weitere Kräfte werden nicht benötigt.",
    points: 1
},

{
    id: "FK-13",
    category: "Funkcodes",
    question: "Was bedeutet Code 6?",
    answer: "Der Officer befindet sich auf Fußstreife.",
    points: 1
},

/* =========================
   FUNKCODES - SITUATIONEN
========================= */

{
    id: "FK-S1",
    category: "Funkcodes",
    situation: "Du beginnst eine Verkehrskontrolle.",
    question: "Welcher Funkcode wird verwendet und welche Informationen müssen übermittelt werden?",
    answer: "10.26\nZusätzlich:\n• 10.20 (Standort)\n• Fahrzeugbeschreibung",
    points: 3
},

{
    id: "FK-S2",
    category: "Funkcodes",
    situation: "Ein Fahrzeug flüchtet vor der Polizei.",
    question: "Welcher Funkcode wird verwendet?",
    answer: "10.60\nZusätzlich werden Standort, Fahrtrichtung und Fahrzeugbeschreibung durchgegeben. Wenn möglich, übernimmt der Beifahrer den Funk.",
    points: 3
},

{
    id: "FK-S3",
    category: "Funkcodes",
    situation: "Während einer Schießerei wird ein Officer getroffen.",
    question: "Welcher Funkcode ist abzusetzen?",
    answer: "10.99\nMit aktuellem Standort (10.20).",
    points: 2
},

{
    id: "FK-S4",
    category: "Funkcodes",
    situation: "Alle Täter wurden festgenommen. Weitere Unterstützung ist nicht erforderlich.",
    question: "Welcher Code wird gefunkt?",
    answer: "Code 4\nDie Lage ist unter Kontrolle, weitere Unterstützung wird nicht benötigt.",
    points: 2
},

/* =========================
   KORRUPTION
========================= */

{
    id: "K-1",
    category: "Korruption",
    question: "Wie ist die Einstellung der Staatsfraktionen gegenüber Korruption?",
    answer: "Korruption wird nicht geduldet und konsequent verfolgt.",
    points: 1
},

{
    id: "K-2",
    category: "Korruption",
    question: "Was versteht man unter Korruption?",
    answer: "Korruption ist der Missbrauch einer dienstlichen Stellung durch die Annahme oder Forderung von Vorteilen, um dienstliche Entscheidungen zu beeinflussen.",
    points: 1
},

{
    id: "K-3",
    category: "Korruption",
    question: "Wie verhältst du dich, wenn dir ein Bürger Geld anbietet, damit du ihn laufen lässt?",
    answer: "• Angebot ablehnen.\n• Keine Gegenleistung annehmen.\n• Vorfall dokumentieren.\n• Vorgesetzten informieren.",
    points: 4
},

{
    id: "K-4",
    category: "Korruption",
    situation: "Während einer Verkehrskontrolle bietet dir ein Fahrer 100.000 $, damit du kein Bußgeld ausstellst.",
    question: "Wie reagierst du?",
    answer: "Ich lehne das Angebot ab, nehme kein Geld an und bearbeite den Fall nach den geltenden Vorschriften.",
    points: 2
},

{
    id: "K-5",
    category: "Korruption",
    situation: "Ein Officer lässt einen Täter gegen Zahlung von Geld frei.",
    question: "Wie ist das zu bewerten?",
    answer: "Dies stellt Korruption dar und ist ein schwerer Verstoß gegen die Dienstpflichten.",
    points: 2
},

{
    id: "K-6",
    category: "Korruption",
    situation: "Ein Beamter verrät gegen Bezahlung den Standort einer Polizeikontrolle.",
    question: "Wie bewertest du dieses Verhalten?",
    answer: "Das Weitergeben dienstlicher Informationen gegen Bezahlung ist Korruption und unzulässig.",
    points: 2
},

/* =========================
   INTERN
========================= */

{
    id: "I-1",
    category: "Intern",
    question: "Was bedeutet der Begriff „intern“?",
    answer: "Intern bedeutet, dass Informationen ausschließlich innerhalb der Fraktion besprochen werden und nicht an Außenstehende gelangen.",
    points: 1
},

{
    id: "I-2",
    category: "Intern",
    question: "Warum dürfen interne Informationen nicht weitergegeben werden?",
    answer: "Weil sie ausschließlich für die Fraktion bestimmt sind und eine Weitergabe laufende Einsätze oder Ermittlungen gefährden kann.",
    points: 1
},

{
    id: "I-3",
    category: "Intern",
    situation: "Ein befreundeter Zivilist fragt dich nach dem aktuellen Standort einer laufenden Polizeiaktion.",
    question: "Wie verhältst du dich?",
    answer: "Ich gebe keine Informationen weiter, da diese intern sind.",
    points: 2
},

{
    id: "I-4",
    category: "Intern",
    situation: "Ein Beamter veröffentlicht interne Einsatzinformationen auf einem öffentlichen Discord-Server.",
    question: "Wie ist dies zu bewerten?",
    answer: "Dies stellt einen Verstoß gegen die Pflicht zur Vertraulichkeit dar, da interne Informationen nicht veröffentlicht werden dürfen.",
    points: 2
},

/* =========================
   DIENSTVORSCHRIFTEN
========================= */

{
    id: "DV-1",
    category: "Dienstvorschriften",
    question: "Wie sollte sich ein Polizeibeamter im Dienst verhalten?",
    answer: "Ein Polizeibeamter handelt jederzeit professionell, respektvoll und hält sich an alle Dienstvorschriften sowie an die geltenden RP-Regeln.",
    points: 2
},

{
    id: "DV-2",
    category: "Dienstvorschriften",
    question: "Was bedeutet Verhältnismäßigkeit?",
    answer: "Es dürfen nur solche Maßnahmen eingesetzt werden, die erforderlich und angemessen sind.",
    points: 1
},

{
    id: "DV-3",
    category: "Dienstvorschriften",
    situation: "Ein Bürger bleibt nach einer Verkehrskontrolle ruhig stehen und kooperiert vollständig.",
    question: "Darf sofort der Taser eingesetzt werden?",
    answer: "Nein. Da keine Gefahr besteht und der Bürger kooperiert, wäre der Einsatz eines Tasers unverhältnismäßig.",
    points: 2
},

{
    id: "DV-4",
    category: "Dienstvorschriften",
    question: "Wie sollte die Kommunikation eines Officers erfolgen?",
    answer: "Ruhig, höflich, professionell und eindeutig.",
    points: 1
},

{
    id: "DV-5",
    category: "Dienstvorschriften",
    situation: "Ein Officer fordert Unterstützung an.",
    question: "Wie verhältst du dich?",
    answer: "Wenn ich verfügbar bin, unterstütze ich den Kollegen und bestätige dies über Funk.",
    points: 2
},

{
    id: "DV-6",
    category: "Dienstvorschriften",
    question: "Welche Auswirkungen hat genehmigter Urlaub?",
    answer: "Während eines genehmigten Urlaubs besteht grundsätzlich keine Verpflichtung zur aktiven Dienstausübung.",
    points: 1
},

{
    id: "DV-7",
    category: "Dienstvorschriften",
    situation: "Ein Beamter befindet sich im Urlaub und wird zu einem Einsatz aufgefordert.",
    question: "Wie ist die Situation zu bewerten?",
    answer: "Grundsätzlich besteht während des genehmigten Urlaubs keine Verpflichtung, den Dienst aufzunehmen. Ausnahmen richten sich nach den internen Regelungen der Fraktion.",
    points: 2
},

{
    id: "DV-8",
    category: "Dienstvorschriften",
    situation: "Mehrere bewaffnete Täter flüchten mit einem Fahrzeug.",
    question: "Welche ersten Maßnahmen sind einzuleiten?",
    answer: "• Lage beurteilen.\n• Funk absetzen.\n• Verstärkung anfordern.\n• Verfolgung aufnehmen.\n• Eigensicherung beachten.",
    points: 5
},

{
    id: "DV-9",
    category: "Dienstvorschriften",
    situation: "Ein Bürger verhält sich aggressiv, greift jedoch niemanden an.",
    question: "Wie gehst du vor?",
    answer: "• Ruhig bleiben.\n• Kommunikation suchen.\n• Situation deeskalieren.\n• Erst bei einer tatsächlichen Gefahr weitere Zwangsmittel einsetzen.",
    points: 4
}

];
