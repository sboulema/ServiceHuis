/// <reference path="typings/jinqjs/jinqjs.d.ts" />
/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="models/verkooppunt.ts" />
/// <reference path="models/gebied.ts" />
/// <reference path="models/gebiedregeling.ts" />
/// <reference path="models/tijdvak.ts" />
/// <reference path="models/tariefdeel.ts" />
/// <reference path="models/results.ts" />
/// <reference path="models/regeling.ts" />

namespace ServiceHuis {
    export module DataSets {

        export function getInfoByAreaManagerId(areaManagerId: string, callback: any, city?: string, usageId?: string, filterOnActive?: boolean) {
            const info = new Results();
            info.areamanagerid = areaManagerId;
            info.city = city;
            loadGebieden(areaManagerId, processGebieden, usageId, filterOnActive, info, callback);
        }

        function processGebieden(gebieden, info: Results, processInfo: any) {
            info.gebieden = gebieden;
            loadGebiedRegeling(info.areamanagerid, null, true, processGebiedRegeling, info, processInfo);
        }

        function processGebiedRegeling(regelingen, info: Results, processInfo: any) {
            info.gebiedregelingen = regelingen;
            loadRegeling(info.areamanagerid, processRegelingen, true, info, processInfo);
        }

        function processRegelingen(regelingen, info: Results, processInfo: any) {
            info.regelingen = regelingen;
            loadTijdvak(info.areamanagerid, null, true, processTijdvak, info, processInfo);
        }

        function processTijdvak(tijdvakken, info: Results, processInfo: any) {
            info.tijdvakken = tijdvakken;
            loadTariefdeel(info.areamanagerid, null, true, processTariefdeel, info, processInfo);
        }

        function processTariefdeel(tariefdelen, info: Results, processInfo: any) {
            info.tariefdelen = tariefdelen;
            processInfo(info);
        }

        /**
         * http://nprverkooppunten.rdw.nl/Productie/verkooppunten.txt
         */
        export function loadVerkooppunten(callback: any) {
            $.get("http://cors.sboulema.nl/" + "http://nprverkooppunten.rdw.nl/Productie/verkooppunten.txt", data => {
                var lines = data.split("\n");
                lines.splice(0, 1);

                var verkooppunten = new Array<IVerkooppunt>();

                $.each(lines, (n, line) => {
                    var lineSegments = line.split(";");
                    verkooppunten.push(new Verkooppunt(lineSegments));
                });

                callback(verkooppunten);
            });
        }

        /**
         * Tabel met informatie over de rechtspersoon die zeggenschap heeft over het gebruiksdoel en de regeling van een gebied.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIEDSBEHEERDER/2uc2-nnv3
         */
        export function loadGebiedsbeheerders(callback: any) {
            $.getJSON("https://opendata.rdw.nl/resource/t6n6-h9zf.json", data => {
                data = data.sort(compareByDesc);
                callback(data);
            });
        }

        /** 
         * Een benoemde ruimte met een gebruiksdoel waar een voertuig zich onder condities kan begeven of bevinden.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIED/adw6-9hsg
         */
        export function loadGebieden(areamanagerid: string, callback: any, usageId?: string, filterOnActive?: boolean, callbackParams?: any, callbackFinal?: any) {
            $.getJSON(`https://opendata.rdw.nl/resource/8u4d-s4q7.json?areamanagerid=${areamanagerid}`, data => {
                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where<IGebied>(row => (parseDate(row.startdatearea) <= new Date() && parseDate(row.enddatearea) >= new Date()))
                        .select(row => row);
                }

                if (usageId) {
                    data = new jinqJs()
                        .from(data)
                        .where<IGebied>(row => (row.usageid === usageId))
                        .select(row => row);
                }

                callback(data, callbackParams, callbackFinal);
                return data;
            });
        }

        /**
         * Regeling of regelingen die op een gebied van toepassing zijn. Op een bepaald moment is op één gebied maar één regeling van toepassing, maar de regeling die van toepassing is op een gebied, kan periodiek veranderen.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEBIED-REGELING/qtex-qwd8
         */
        export function loadGebiedRegeling(areamanagerid: string, areaid: string, filterOnActive: boolean, callback: any, callbackParams: any, callbackFinal: any) {
            let url = `https://opendata.rdw.nl/resource/v7za-hcf3.json?areamanagerid=${areamanagerid}`;
            if (areaid !== null) {
                url += `&areaid=${areaid}`;
            }

            $.getJSON(url, data => {

                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where<IGebiedRegeling>(row => (parseDate(row.startdatearearegulation) <= new Date() && parseDate(row.enddatearearegulation) >= new Date()))
                        .select(row => row);
                }

                callback(data, callbackParams, callbackFinal);
                return data;
            });
        }

        /**
         * Deze tabel legt een koppeling tussen de gebieden zoals deze vastgelegd zijn in het NPR en de gebieden zoals deze voor Open Data Parkeren volgens de standaard SPDP2.0 gepubliceerd worden.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-PARKEERGEBIED/mz4f-59fw
         */
        export function loadParkeergebieden(areamanagerid: string, callback: any, callbackParams: any, callbackFinal: any) {
            $.getJSON(`https://opendata.rdw.nl/resource/svfa-juwh.json?areamanagerid=${areamanagerid}`, data => {
                callback(data, callbackParams, callbackFinal);
            });
        }

        /**
         * Een deel van een benoemd etmaal waarin een bepaalde regeling van toepassing is. In een etmaal kan voor nul, een of meerdere tijdvakken worden geregistreerd welk tarief van toepassing is en kunnen andere 
         * aspecten van een regeling worden vastgelegd. Tijdvakken mogen niet overlappen, maar tijdvakken hoeven niet aaneen te sluiten. Voor die gedeelten van het etmaal waarvoor geen tijdvak is, geldt dat volgens 
         * de regeling het recht geen tarief heeft, bv. overdag betaald parkeren, maar 's avonds en 's nachts gratis.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TIJDVAK/ixf8-gtwq
         */
        export function loadTijdvak(areamanagerid: string, fareCalculationCode: string, filterOnActive: boolean, callback: any, callbackParams: any, callbackFinal: any) {
            $.getJSON(`https://opendata.rdw.nl/resource/pwnm-2uua.json?areamanagerid=${areamanagerid}`, data => {

                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where<ITijdvak>(row => (parseDate(row.startdatetimeframe) <= new Date() && parseDate(row.enddatetimeframe) >= new Date()))
                        .select(row => row);
                }

                if (fareCalculationCode !== null) {
                    data = new jinqJs()
                        .from(data)
                        .where<ITijdvak>(row => (typeof row.farecalculationcode !== "undefined") && row.farecalculationcode.indexOf(fareCalculationCode) > -1)
                        .select(row => row);
                }

                callback(data, callbackParams, callbackFinal);
            });
        }

        /**
         * Een tarief bestaat uit 1 of meerdere tariefdelen. Als er een vast tarief per tijdvak is, ongeacht de parkeerduur, dan is er 1 deel zonder tariefdeel duurbegrenzing. Als het tarief afhankelijk is van de 
         * parkeerduur (progressief/degressief tarief), zijn er meerdere tariefdelen, waarvan een aantal qua duur begrensd.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-TARIEFDEEL/534e-5vdg
         */
        export function loadTariefdeel(areamanagerid: string, fareCalculationCode: string, filterOnActive: boolean, callback: any, callbackParams: any, callbackFinal: any) {
            let url = `https://opendata.rdw.nl/resource/m3un-bgqw.json?areamanagerid=${areamanagerid}`;
            if (fareCalculationCode !== null) {
                url += `&farecalculationcode=${fareCalculationCode}`;
            }

            $.getJSON(url, data => {

                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where<ITariefdeel>(row => parseDate(row.startdatefarepart) <= new Date() && parseDate(row.enddatefarepart) >= new Date())
                        .select(row => row);
                }

                callback(data, callbackParams, callbackFinal);
            });
        }

        /**
         * Een regeling bevat alle condities die gelden wanneer iemand een recht voor een bepaald gebied verwerft.
         * https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-REGELING/pezp-7mrc
         */
        export function loadRegeling(areamanagerid: string, callback: any, filterOnActive?: boolean, callbackParams?: any, callbackFinal?: any) {
            $.getJSON(`https://opendata.rdw.nl/resource/n5c7-ce36.json?areamanagerid=${areamanagerid}`, data => {

                if (filterOnActive) {
                    data = new jinqJs()
                        .from(data)
                        .where<IRegeling>(row => parseDate(row.startdateregulation) <= new Date() && parseDate(row.enddateregulation) >= new Date())
                        .select(row => row);
                }

                callback(data, callbackParams, callbackFinal);
            });
        }
    }

    export module Utils {
        export function getZoneCodes(verkooppunten: Verkooppunt[], areamanagerid: string, areaid: string) {
            return new jinqJs()
                .from(verkooppunten)
                .where<Verkooppunt>(row => (row.gebied === areaid && row.gebDomein === areamanagerid))
                .select<string>(<Verkooppunt>(row) => row.verkooppunt);
        }

        export function formatTimeframe(timeframe: string) {
            const min = timeframe.substr(timeframe.length - 2);
            let hour = timeframe.substr(0, timeframe.length - min.length);

            if (+hour < 10) {
                hour = `0${hour}`;
            }

            return hour + ":" + min;
        }
    }

    // Sort by areamanagerdesc
    function compareByDesc(a: any, b: any) {
        if (a.areamanagerdesc < b.areamanagerdesc)
            return -1;
        if (a.areamanagerdesc > b.areamanagerdesc)
            return 1;
        return 0;
    }

    // Parse string formatted like 20140623000000 to a date
    function parseDate(dateString: string) {
        const year = +dateString.substring(0, 4);
        const month = +dateString.substring(4, 6) - 1;
        const day = +dateString.substring(6, 8);
        return new Date(year, month, day);
    }
}