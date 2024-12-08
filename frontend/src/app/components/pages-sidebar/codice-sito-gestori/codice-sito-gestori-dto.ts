export class CodiceSitoGestoriDto {
    numcodsito?: any;
    numcodsitoold?: string;
    nomesito?: string;
    gestore?: string;
    tipoimpianto?: string;
    regione?: string;
    provincia?: string;
    comune?: string;
    indirizzo?: string;
    numlocosscem?: string;
    locosscem?: string;
    coordinatelong?: string;
    coordinatelat?: string;

    protocollocheck?: string;
    protcoll?: [];

    linkcondivisia?: string;

    dataprot?: string;
    statoimpianto?: string;
    statoprocedura?: string;
}

export class CodiceSitoGestoriPopUpDto {
    numcodsito: string | null;
    numcodsitoold: string | null;
    nomesito: string | null;
    gestore: string | null;
    tipoimpianto: any | null;
    regione: string | null;
    provincia: string | null;
    comune: string | null;
    indirizzo: string | null;
    numlocosscem: number | null;
    locosscem: string | null;
    coordinatelong: number | null;
    coordinatelat: number | null;
    protocollocheck: any | null;
    dataprot: any | null;
    protcoll: any | null;
    statoimpianto: any | null;
    statoprocedura: any | null;
    linkcondivisia: string | null;
}
