namespace ServiceHuis {
    export interface IVerkooppunt {
        verkooppunt: string;
        longitude: string;
        latitude: string;
        gebied: string;
        vkpBegin: string;
        vkpEind: string;
        gebBegin: string;
        gebEind: string;
        vkpDomein: string;
        gebDomein: string;
        vkpOmschrijving: string;
        gebrDoelGeb: string;       
    }

    export class Verkooppunt implements IVerkooppunt {
        verkooppunt: string;
        longitude: string;
        latitude: string;
        gebied: string;
        vkpBegin: string;
        vkpEind: string;
        gebBegin: string;
        gebEind: string;
        vkpDomein: string;
        gebDomein: string;
        vkpOmschrijving: string;
        gebrDoelGeb: string; 

        constructor(lineSegments: any[]) {
            [this.verkooppunt, this.longitude, this.latitude, this.gebied, this.vkpBegin, this.vkpEind,
                this.gebBegin, this.gebEind, this.vkpDomein, this.gebDomein, this.vkpOmschrijving, this.gebrDoelGeb] = lineSegments;
        }
    }
}