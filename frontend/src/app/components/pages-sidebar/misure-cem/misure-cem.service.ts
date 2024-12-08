import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {MisureCemDto} from "./misure-cem-dto";
import {MisureCemComponent} from "./misure-cem.component";
import {CodiceSitoGestoriPopUpDto} from "../codice-sito-gestori/codice-sito-gestori-dto";
import {StrumentiCemDto} from "../strumenti-cem/strumenti-cem-dto";

@Injectable({
  providedIn: 'root'
})
export class MisureCemService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getMisureCemData(): Observable<MisureCemDto[]> {
    const networkUrl = this._portalApiRoot + `misurecemAll`;
    return this.http
        .get<BaseResponse<MisureCemDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }

  getStrumentoForClickedPopup(strumento: any): Observable<StrumentiCemDto[]> {
    const networkUrl = this._portalApiRoot + `strumenticem/m/${strumento}`;
    return this.http
        .get<BaseResponse<StrumentiCemDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }

  postSaveNewMisureCemData(dtoOut: MisureCemDto): Observable<MisureCemDto> {
    const networkUrl = this._portalApiRoot + `misurecemrf`;
    return this.http.post<MisureCemDto>(networkUrl,{fields:dtoOut});
  }
  putUpdatedOneDataMisureCem(idimiscem: number, dtoOut: MisureCemDto): Observable<MisureCemDto> {
    const networkUrl = `${this._portalApiRoot}misurecemrf?idimiscem=${idimiscem}`;
    return this.http.put<MisureCemDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataMisureCem(idimiscem: any): Observable<any> {
    const primaryKey = 'idimiscem';
    const networkUrl = `${this._portalApiRoot}misurecemrf/single?primaryKey=${primaryKey}&primaryKeyValue=${idimiscem}`;
    return this.http.delete<any>(networkUrl);
  }
  deletemultipleSelectedDatasMisureCem(idimiscems: number[]): Observable<any> {
    const primaryKey = 'idimiscem';
    const networkUrl = `${this._portalApiRoot}misurecemrf/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: idimiscems });
  }

  regioneSelectboxValuesCodiceSitoGestori(): Observable<any>{
    const networkUrl = this._portalApiRoot + `gi_regioni/regione`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  provinciaSelectboxValuesMisureCem(regioneCode: string): Observable<any[]> {
    const networkUrl = `${this._portalApiRoot}gi_province/provincia/${regioneCode}`;
    return this.http.get<BaseResponse<any[]>>(networkUrl).pipe(map(m => m.data));
  }

  comuneSelectboxValuesMisureCem(provinciaCode: string): Observable<any[]> {
    const networkUrl = `${this._portalApiRoot}gi_comuni/comune/${provinciaCode}`;
    return this.http.get<BaseResponse<any[]>>(networkUrl).pipe(map(m => m.data));
  }

  numcodsitoSelectboxValuesRilevazioniSito(): Observable<any>{
    const networkUrl = this._portalApiRoot + `codicesitogestori/numcodsito`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  modellostrumSelectboxValuesRilevazioniSito(): Observable<any>{
    const networkUrl = this._portalApiRoot + `strumenticem/model`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sondaCollegataSelectboxValuesRilevazioniSito(): Observable<any>{
    const networkUrl = this._portalApiRoot + `misurecemrf/sonda`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  taraturastrumSelectboxValuesRilevazioniSito(): Observable<any>{
    const networkUrl = this._portalApiRoot + `misurecemrf/tartstrum`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }

}
