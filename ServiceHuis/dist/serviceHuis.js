var ServiceHuis;
(function (ServiceHuis) {
    var Verkooppunt = (function () {
        function Verkooppunt(lineSegments) {
            this.verkooppunt = lineSegments[0], this.longitude = lineSegments[1], this.latitude = lineSegments[2], this.gebied = lineSegments[3], this.vkpBegin = lineSegments[4], this.vkpEind = lineSegments[5], this.gebBegin = lineSegments[6], this.gebEind = lineSegments[7], this.vkpDomein = lineSegments[8], this.gebDomein = lineSegments[9], this.vkpOmschrijving = lineSegments[10], this.gebrDoelGeb = lineSegments[11];
        }
        return Verkooppunt;
    }());
    ServiceHuis.Verkooppunt = Verkooppunt;
})(ServiceHuis || (ServiceHuis = {}));
var ServiceHuis;
(function (ServiceHuis) {
    var Results = (function () {
        function Results() {
        }
        return Results;
    }());
    ServiceHuis.Results = Results;
})(ServiceHuis || (ServiceHuis = {}));
/// <reference path="typings/jinqjs/jinqjs.d.ts" />
/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="models/verkooppunt.ts" />
/// <reference path="models/gebied.ts" />
/// <reference path="models/gebiedregeling.ts" />
/// <reference path="models/tijdvak.ts" />
/// <reference path="models/tariefdeel.ts" />
/// <reference path="models/results.ts" />
/// <reference path="models/regeling.ts" />
var ServiceHuis;
(function (ServiceHuis) {
    var DataSets;
    (function (DataSets) {
        /**
         * Alle gebieden, gebiedregelingen, regelingen, tijdvakken en tariefdelen horende bij de opgegeven gebiedsbeheerder.
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param city Beschrijving van de gebiedsbeheerder.
         * @param usageId Filter op identificatiecode van het gebruiksdoel dat geldt voor een parkeergebied of -faciliteit.
         * @param filterOnActive Filter op geldigheid van de gebieden.
         * @returns Object met alle info voor gebiedsbeheerder via callback functie.
         */
        function getInfoByAreaManagerId(areaManagerId, callback, city, usageId, filterOnActive) {
            var info = new ServiceHuis.Results();
            info.areamanagerid = areaManagerId;
            info.city = city;
            loadGebieden(areaManagerId, processGebieden, usageId, filterOnActive, info, callback);
        }
        DataSets.getInfoByAreaManagerId = getInfoByAreaManagerId;
        function processGebieden(gebieden, info, processInfo) {
            info.gebieden = gebieden;
            loadGebiedRegeling(info.areamanagerid, null, true, processGebiedRegeling, info, processInfo);
        }
        function processGebiedRegeling(regelingen, info, processInfo) {
            info.gebiedregelingen = regelingen;
            loadRegeling(info.areamanagerid, processRegelingen, true, info, processInfo);
        }
        function processRegelingen(regelingen, info, processInfo) {
            info.regelingen = regelingen;
            loadTijdvak(info.areamanagerid, null, true, processTijdvak, info, processInfo);
        }
        function processTijdvak(tijdvakken, info, processInfo) {
            info.tijdvakken = tijdvakken;
            loadTariefdeel(info.areamanagerid, null, true, processTariefdeel, info, processInfo);
        }
        function processTariefdeel(tariefdelen, info, processInfo) {
            info.tariefdelen = tariefdelen;
            processInfo(info);
        }
        /**
         * Lijst met verkooppunten
         * http://nprverkooppunten.rdw.nl/Productie/verkooppunten.txt
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @returns Lijst van verkooppunten via callback functie.
         */
        function loadVerkooppunten(callback) {
            $.get("http://cors.sboulema.nl/" + "http://nprverkooppunten.rdw.nl/Productie/verkooppunten.txt", function (data) {
                var lines = data.split("\n");
                lines.splice(0, 1);
                var verkooppunten = new Array();
                $.each(lines, function (n, line) {
                    var lineSegments = line.split(";");
                    verkooppunten.push(new ServiceHuis.Verkooppunt(lineSegments));
                });
                callback(verkooppunten);
            });
        }
        DataSets.loadVerkooppunten = loadVerkooppunten;
        /**
         * Tabel met informatie over de rechtspersoon die zeggenschap heeft over het gebruiksdoel en de regeling van een gebied.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIEDSBEHEERDER/2uc2-nnv3
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @returns Lijst van gebiedsbeheerders via callback functie.
         */
        function loadGebiedsbeheerders(callback) {
            $.getJSON("https://opendata.rdw.nl/resource/t6n6-h9zf.json", function (data) {
                data = data.sort(compareByDesc);
                callback(data);
            });
        }
        DataSets.loadGebiedsbeheerders = loadGebiedsbeheerders;
        /**
         * Een benoemde ruimte met een gebruiksdoel waar een voertuig zich onder condities kan begeven of bevinden.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIED/adw6-9hsg
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param usageId Filter op identificatiecode van het gebruiksdoel dat geldt voor een parkeergebied of -faciliteit.
         * @param filterOnActive Filter op geldigheid van de gebieden.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param callbackParams Parameter die meegegeven zal worden aan de callback functie
         * @param callbackFinal Functie die aangeroepen zal worden in de callback functie
         * @returns Lijst van gebieden via callback functie.
         */
        function loadGebieden(areamanagerid, callback, usageId, filterOnActive, callbackParams, callbackFinal) {
            $.getJSON("https://opendata.rdw.nl/resource/8u4d-s4q7.json?areamanagerid=" + areamanagerid, function (data) {
                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return (parseDate(row.startdatearea) <= new Date() && parseDate(row.enddatearea) >= new Date()); })
                        .select(function (row) { return row; });
                }
                if (usageId) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return (row.usageid === usageId); })
                        .select(function (row) { return row; });
                }
                callback(data, callbackParams, callbackFinal);
            });
        }
        DataSets.loadGebieden = loadGebieden;
        /**
         * Regeling of regelingen die op een gebied van toepassing zijn. Op een bepaald moment is op één gebied maar één regeling van toepassing, maar de regeling die van toepassing is op een gebied, kan periodiek veranderen.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIED-REGELING/qtex-qwd8
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param areaid Identificatiecode van een parkeergebied of - faciliteit.
         * @param filterOnActive Filter op de geldigheid van de gebiedregelingen.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param callbackParams Parameter die meegegeven zal worden aan de callback functie
         * @param callbackFinal Functie die aangeroepen zal worden in de callback functie
         * @returns Lijst van gebiedregelingen via callback functie.
         */
        function loadGebiedRegeling(areamanagerid, areaid, filterOnActive, callback, callbackParams, callbackFinal) {
            var url = "https://opendata.rdw.nl/resource/v7za-hcf3.json?areamanagerid=" + areamanagerid;
            if (areaid !== null) {
                url += "&areaid=" + areaid;
            }
            $.getJSON(url, function (data) {
                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return (parseDate(row.startdatearearegulation) <= new Date() && parseDate(row.enddatearearegulation) >= new Date()); })
                        .select(function (row) { return row; });
                }
                callback(data, callbackParams, callbackFinal);
            });
        }
        DataSets.loadGebiedRegeling = loadGebiedRegeling;
        /**
         * Deze tabel legt een koppeling tussen de gebieden zoals deze vastgelegd zijn in het NPR en de gebieden zoals deze voor Open Data Parkeren volgens de standaard SPDP2.0 gepubliceerd worden.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-PARKEERGEBIED/mz4f-59fw
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param callbackParams Parameter die meegegeven zal worden aan de callback functie
         * @param callbackFinal Functie die aangeroepen zal worden in de callback functie
         * @returns Lijst van parkeergebieden via callback functie.
         */
        function loadParkeergebieden(areamanagerid, callback, callbackParams, callbackFinal) {
            $.getJSON("https://opendata.rdw.nl/resource/svfa-juwh.json?areamanagerid=" + areamanagerid, function (data) {
                callback(data, callbackParams, callbackFinal);
            });
        }
        DataSets.loadParkeergebieden = loadParkeergebieden;
        /**
         * Een deel van een benoemd etmaal waarin een bepaalde regeling van toepassing is. In een etmaal kan voor nul, een of meerdere tijdvakken worden geregistreerd welk tarief van toepassing is en kunnen andere
         * aspecten van een regeling worden vastgelegd. Tijdvakken mogen niet overlappen, maar tijdvakken hoeven niet aaneen te sluiten. Voor die gedeelten van het etmaal waarvoor geen tijdvak is, geldt dat volgens
         * de regeling het recht geen tarief heeft, bv. overdag betaald parkeren, maar 's avonds en 's nachts gratis.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TIJDVAK/ixf8-gtwq
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param fareCalculationCode Verwijzing naar het tarief, indien voor een recht in een tijdvak een tarief verschuldigd is.
         * @param filterOnActive Filter op de geldigheid van de tijdvakken.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param callbackParams Parameter die meegegeven zal worden aan de callback functie
         * @param callbackFinal Functie die aangeroepen zal worden in de callback functie
         * @returns Lijst van gebiedregelingen via callback functie.
         */
        function loadTijdvak(areamanagerid, fareCalculationCode, filterOnActive, callback, callbackParams, callbackFinal) {
            $.getJSON("https://opendata.rdw.nl/resource/pwnm-2uua.json?areamanagerid=" + areamanagerid, function (data) {
                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return (parseDate(row.startdatetimeframe) <= new Date() && parseDate(row.enddatetimeframe) >= new Date()); })
                        .select(function (row) { return row; });
                }
                if (fareCalculationCode !== null) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return (typeof row.farecalculationcode !== "undefined") && row.farecalculationcode.indexOf(fareCalculationCode) > -1; })
                        .select(function (row) { return row; });
                }
                callback(data, callbackParams, callbackFinal);
            });
        }
        DataSets.loadTijdvak = loadTijdvak;
        /**
         * Een tarief bestaat uit 1 of meerdere tariefdelen. Als er een vast tarief per tijdvak is, ongeacht de parkeerduur, dan is er 1 deel zonder tariefdeel duurbegrenzing. Als het tarief afhankelijk is van de
         * parkeerduur (progressief/degressief tarief), zijn er meerdere tariefdelen, waarvan een aantal qua duur begrensd.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TARIEFDEEL/534e-5vdg
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param fareCalculationCode Verwijzing naar het tarief, indien voor een recht in een tijdvak een tarief verschuldigd is.
         * @param filterOnActive Filter op de geldigheid van de tariefdelen.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param callbackParams Parameter die meegegeven zal worden aan de callback functie
         * @param callbackFinal Functie die aangeroepen zal worden in de callback functie
         * @returns Lijst van tariefdelen via callback functie.
         */
        function loadTariefdeel(areamanagerid, fareCalculationCode, filterOnActive, callback, callbackParams, callbackFinal) {
            var url = "https://opendata.rdw.nl/resource/m3un-bgqw.json?areamanagerid=" + areamanagerid;
            if (fareCalculationCode !== null) {
                url += "&farecalculationcode=" + fareCalculationCode;
            }
            $.getJSON(url, function (data) {
                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return parseDate(row.startdatefarepart) <= new Date() && parseDate(row.enddatefarepart) >= new Date(); })
                        .select(function (row) { return row; });
                }
                callback(data, callbackParams, callbackFinal);
            });
        }
        DataSets.loadTariefdeel = loadTariefdeel;
        /**
         * Een regeling bevat alle condities die gelden wanneer iemand een recht voor een bepaald gebied verwerft.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-REGELING/pezp-7mrc
         * @param areamanagerid Identificatiecode van de gebiedsbeheerder of parkeerexploitant.
         * @param filterOnActive Filter op de geldigheid van de regelingen.
         * @param callback Functie die aangeroepen zal worden met resultaat
         * @param callbackParams Parameter die meegegeven zal worden aan de callback functie
         * @param callbackFinal Functie die aangeroepen zal worden in de callback functie
         * @returns Lijst van regelingen via callback functie.
         */
        function loadRegeling(areamanagerid, callback, filterOnActive, callbackParams, callbackFinal) {
            $.getJSON("https://opendata.rdw.nl/resource/n5c7-ce36.json?areamanagerid=" + areamanagerid, function (data) {
                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where(function (row) { return parseDate(row.startdateregulation) <= new Date() && parseDate(row.enddateregulation) >= new Date(); })
                        .select(function (row) { return row; });
                }
                callback(data, callbackParams, callbackFinal);
            });
        }
        DataSets.loadRegeling = loadRegeling;
    })(DataSets = ServiceHuis.DataSets || (ServiceHuis.DataSets = {}));
    var Utils;
    (function (Utils) {
        function getZoneCodes(verkooppunten, areamanagerid, areaid) {
            if ((typeof areaid === "undefined")) {
                return [""];
            }
            return new jinqJs()
                .from(verkooppunten)
                .where(function (row) { return (typeof areaid !== "undefined" && row.gebied.toUpperCase() === areaid.toUpperCase() && row.gebDomein === areamanagerid); })
                .select(function (row) { return row.verkooppunt; });
        }
        Utils.getZoneCodes = getZoneCodes;
        function formatTimeframe(timeframe) {
            if (timeframe === "0") {
                return "00:00";
            }
            var min = timeframe.substr(timeframe.length - 2);
            var hour = timeframe.substr(0, timeframe.length - min.length);
            if (+hour < 10) {
                hour = "0" + hour;
            }
            return hour + ":" + min;
        }
        Utils.formatTimeframe = formatTimeframe;
    })(Utils = ServiceHuis.Utils || (ServiceHuis.Utils = {}));
    // Sort by areamanagerdesc
    function compareByDesc(a, b) {
        if (a.areamanagerdesc < b.areamanagerdesc)
            return -1;
        if (a.areamanagerdesc > b.areamanagerdesc)
            return 1;
        return 0;
    }
    // Parse string formatted like 20140623000000 to a date
    function parseDate(dateString) {
        var year = +dateString.substring(0, 4);
        var month = +dateString.substring(4, 6) - 1;
        var day = +dateString.substring(6, 8);
        return new Date(year, month, day);
    }
})(ServiceHuis || (ServiceHuis = {}));
//# sourceMappingURL=serviceHuis.js.map