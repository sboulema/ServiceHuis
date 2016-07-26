var ServiceHuis;
(function (ServiceHuis) {
    var Interfaces;
    (function (Interfaces) {
        var Verkooppunt = (function () {
            function Verkooppunt(lineSegments) {
                this.verkooppunt = lineSegments[0], this.longitude = lineSegments[1], this.latitude = lineSegments[2], this.gebied = lineSegments[3], this.vkpBegin = lineSegments[4], this.vkpEind = lineSegments[5], this.gebBegin = lineSegments[6], this.gebEind = lineSegments[7], this.vkpDomein = lineSegments[8], this.gebDomein = lineSegments[9], this.vkpOmschrijving = lineSegments[10], this.gebrDoelGeb = lineSegments[11];
            }
            return Verkooppunt;
        }());
        Interfaces.Verkooppunt = Verkooppunt;
    })(Interfaces = ServiceHuis.Interfaces || (ServiceHuis.Interfaces = {}));
})(ServiceHuis || (ServiceHuis = {}));
//# sourceMappingURL=IVerkooppunt.js.map