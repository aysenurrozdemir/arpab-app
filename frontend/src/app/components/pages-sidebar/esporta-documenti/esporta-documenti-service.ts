import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {FileUpload} from "primeng/fileupload";

@Injectable({
  providedIn: 'root'
})
export class EsportaDocumentiService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

    downloadNumeroProtocolloFile(numeroProtocollo: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}exportdoc/notadigos/${numeroProtocollo}`;
        return this.http.post<any>(networkUrl, {});
    }
    downloadNumeroCodiceSitoFile(numeroCodiceSito: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}downloadNumeroCodiceSito/${numeroCodiceSito}`;
        return this.http.post<any>(networkUrl, {});
    }
    downloadNumeroCodiceSitoPerSoprolluogoFile(numeroCodiceSitoPerSoprolluogo: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}downloadNumeroCodiceSitoPerSoprolluogo/${numeroCodiceSitoPerSoprolluogo}`;
        return this.http.post<any>(networkUrl, {});
    }
    downloadNumeroCodiceSitoPerVincolataFile(numeroCodiceSitoPerVincolata: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}downloadNumeroCodiceSitoPerVincolata/${numeroCodiceSitoPerVincolata}`;
        return this.http.post<any>(networkUrl, {});
    }
    downloadNumeroCodiceSitoPerRichiestaFile(numeroCodiceSitoPerRichiesta: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}downloadNumeroCodiceSitoPerRichiesta/${numeroCodiceSitoPerRichiesta}`;
        return this.http.post<any>(networkUrl, {});
    }
    downloadCodiceSitoPerRapportoDiMisuraFile(codiceSitoPerRapportoDiMisura: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}downloadCodiceSitoPerRapportoDiMisura/${codiceSitoPerRapportoDiMisura}`;
        return this.http.post<any>(networkUrl, {});
    }
    downloadFatturazioneDaCompletareFile(fatturazioneDaCompletare: any): Observable<any> {
        const networkUrl = `${this._portalApiRoot}downloadFatturazioneDaCompletare/${fatturazioneDaCompletare}`;
        return this.http.post<any>(networkUrl, {});
    }
}
