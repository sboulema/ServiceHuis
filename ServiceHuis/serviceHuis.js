/// <reference path="typings/jinqjs/jinqjs.d.ts" />
/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="interfaces/igebied.ts" />
/// <reference path="interfaces/igebiedregeling.ts" />
/// <reference path="interfaces/itariefdeel.ts" />
/// <reference path="interfaces/itijdvak.ts" />
/// <reference path="interfaces/iverkooppunt.ts" />
var ServiceHuis;
(function (ServiceHuis) {
    var Verkooppunt = ServiceHuis.Interfaces.Verkooppunt;
    /**
     * http://nprverkooppunten.rdw.nl/Productie/verkooppunten.txt
     */
    function loadVerkooppunten(callback) {
        $.get("http://cors.sboulema.nl/" + "http://nprverkooppunten.rdw.nl/Productie/verkooppunten.txt", function (data) {
            var lines = data.split("\n");
            lines.splice(0, 1);
            var verkooppunten = new Array();
            $.each(lines, function (n, line) {
                var lineSegments = line.split(";");
                verkooppunten.push(new Verkooppunt(lineSegments));
            });
            callback(verkooppunten);
        });
    }
    ServiceHuis.loadVerkooppunten = loadVerkooppunten;
    /**
     * Tabel met informatie over de rechtspersoon die zeggenschap heeft over het gebruiksdoel en de regeling van een gebied.
     * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIEDSBEHEERDER/2uc2-nnv3
     */
    function loadGebiedsbeheerders(callback) {
        $.getJSON("https://opendata.rdw.nl/resource/t6n6-h9zf.json", function (data) {
            data = data.sort(compareByDesc);
            callback(data);
        });
    }
    ServiceHuis.loadGebiedsbeheerders = loadGebiedsbeheerders;
    /**
     * Een benoemde ruimte met een gebruiksdoel waar een voertuig zich onder condities kan begeven of bevinden.
     * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIED/adw6-9hsg
     */
    function loadGebieden(areamanagerid, usageId, filterOnActive, callback, callbackParams) {
        $.getJSON("https://opendata.rdw.nl/resource/8u4d-s4q7.json?areamanagerid=" + areamanagerid, function (data) {
            if (filterOnActive) {
                data = new jinqJs()
                    .from(data)
                    .where(function (row) { return (parseDate(row.startdatearea) <= new Date() && parseDate(row.enddatearea) >= new Date()); })
                    .select(function (row) { return row; });
            }
            if (usageId !== null) {
                data = new jinqJs()
                    .from(data)
                    .where(function (row) { return (row.usageid === usageId); })
                    .select(function (row) { return row; });
            }
            callback(data, callbackParams);
            return data;
        });
    }
    ServiceHuis.loadGebieden = loadGebieden;
    /**
     * Deze tabel legt een koppeling tussen de gebieden zoals deze vastgelegd zijn in het NPR en de gebieden zoals deze voor Open Data Parkeren volgens de standaard SPDP2.0 gepubliceerd worden.
     * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-PARKEERGEBIED/mz4f-59fw
     */
    function loadParkeergebieden(areamanagerid, callback, callbackParams) {
        $.getJSON("https://opendata.rdw.nl/resource/svfa-juwh.json?areamanagerid=" + areamanagerid, function (data) {
            callback(data, callbackParams);
        });
    }
    ServiceHuis.loadParkeergebieden = loadParkeergebieden;
    /**
     * Regeling of regelingen die op een gebied van toepassing zijn. Op een bepaald moment is op één gebied maar één regeling van toepassing, maar de regeling die van toepassing is op een gebied, kan periodiek veranderen.
     * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIED-REGELING/qtex-qwd8
     */
    function loadGebiedRegeling(areamanagerid, areaid, filterOnActive, callback, callbackParams) {
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
            callback(data, callbackParams);
            return data;
        });
    }
    ServiceHuis.loadGebiedRegeling = loadGebiedRegeling;
    /**
     * Een deel van een benoemd etmaal waarin een bepaalde regeling van toepassing is. In een etmaal kan voor nul, een of meerdere tijdvakken worden geregistreerd welk tarief van toepassing is en kunnen andere
     * aspecten van een regeling worden vastgelegd. Tijdvakken mogen niet overlappen, maar tijdvakken hoeven niet aaneen te sluiten. Voor die gedeelten van het etmaal waarvoor geen tijdvak is, geldt dat volgens
     * de regeling het recht geen tarief heeft, bv. overdag betaald parkeren, maar 's avonds en 's nachts gratis.
     * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TIJDVAK/ixf8-gtwq
     */
    function loadTijdvak(areamanagerid, fareCalculationCode, filterOnActive, callback, callbackParams) {
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
            callback(data, callbackParams);
        });
    }
    ServiceHuis.loadTijdvak = loadTijdvak;
    /**
     * Een tarief bestaat uit 1 of meerdere tariefdelen. Als er een vast tarief per tijdvak is, ongeacht de parkeerduur, dan is er 1 deel zonder tariefdeel duurbegrenzing. Als het tarief afhankelijk is van de
     * parkeerduur (progressief/degressief tarief), zijn er meerdere tariefdelen, waarvan een aantal qua duur begrensd.
     * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TARIEFDEEL/534e-5vdg
     */
    function loadTariefdeel(areamanagerid, fareCalculationCode, filterOnActive, callback, callbackParams) {
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
            callback(data, callbackParams);
        });
    }
    ServiceHuis.loadTariefdeel = loadTariefdeel;
    function getZoneCode(verkooppunten, areamanagerid, areaid) {
        var zoneCode = new jinqJs()
            .from(verkooppunten)
            .where(function (row) { return (row.gebied === areaid && row.gebDomein === areamanagerid); })
            .select(function (row) { return row; });
        if (zoneCode.length === 0) {
            return "";
        }
        return zoneCode[0].verkooppunt;
    }
    ServiceHuis.getZoneCode = getZoneCode;
    function formatTimeframe(timeframe) {
        var min = timeframe.substr(timeframe.length - 2);
        var hour = timeframe.substr(0, timeframe.length - min.length);
        if (+hour < 10) {
            hour = "0" + hour;
        }
        return hour + ":" + min;
    }
    ServiceHuis.formatTimeframe = formatTimeframe;
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