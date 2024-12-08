import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {CodiceSitoGestoriDto} from "./codice-sito-gestori-dto";

@Injectable({
  providedIn: 'root'
})
export class CodiceSitoGestoriService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getCodiceSitoGestoriData(): Observable<CodiceSitoGestoriDto[]> {
    const networkUrl = this._portalApiRoot + `codicesitogestoriAll`;
    return this.http
        .get<BaseResponse<CodiceSitoGestoriDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewCodiceSitoGestoriData(dtoOut: CodiceSitoGestoriDto): Observable<CodiceSitoGestoriDto> {
    const networkUrl = this._portalApiRoot + `codicesitogestori`;
    return this.http.post<CodiceSitoGestoriDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataCodiceSitoGestori(numcodsito: any, dtoOut: CodiceSitoGestoriDto): Observable<CodiceSitoGestoriDto> {
    const networkUrl = `${this._portalApiRoot}codicesitogestori?numcodsito=${numcodsito}`;
    return this.http.put<CodiceSitoGestoriDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataCodiceSitoGestori(numcodsito: any): Observable<any> {
    const primaryKey = 'numcodsito';
    const networkUrl = `${this._portalApiRoot}codicesitogestori/single?primaryKey=${primaryKey}&primaryKeyValue=${numcodsito}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasCodiceSitoGestori(numcodsitos: number[]): Observable<any> {
    const primaryKey = 'numcodsito';
    const networkUrl = `${this._portalApiRoot}codicesitogestori/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: numcodsitos});
  }
  radioSchedaElettricaValuesCodiceSitoGestori(numcodsito: string): Observable<any> {
    const networkUrl = this._portalApiRoot + `rilevazionisito/${numcodsito}`;
    return this.http.get<any>(networkUrl);
  }
  gestoreSelectboxValuesCodiceSitoGestori(): Observable<any>{
    const networkUrl = this._portalApiRoot + `gestore`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  statoimpiantoSelectboxValuesCodiceSitoGestori(): Observable<any>{
    const networkUrl = this._portalApiRoot + `statoimpianto`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  statoproceduraSelectboxValuesCodiceSitoGestori(): Observable<any>{
  const networkUrl = this._portalApiRoot + `statoprocedura`;
  return this.http
      .get<BaseResponse<any[]>>(networkUrl)
      .pipe(map((m) => m.data));
  }
  regioneSelectboxValuesCodiceSitoGestori(): Observable<any>{
    const networkUrl = this._portalApiRoot + `gi_regioni/regione`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  provinciaSelectboxValuesCodiceSitoGestori(regioneCode: string): Observable<any[]> {
    const networkUrl = `${this._portalApiRoot}gi_province/provincia/${regioneCode}`;
    return this.http.get<BaseResponse<any[]>>(networkUrl).pipe(map(m => m.data));
  }

  comuneSelectboxValuesCodiceSitoGestori(provinciaCode: string): Observable<any[]> {
    const networkUrl = `${this._portalApiRoot}gi_comuni/comune/${provinciaCode}`;
    return this.http.get<BaseResponse<any[]>>(networkUrl).pipe(map(m => m.data));
  }
  protcollSelectboxValuesCodiceSitoGestori(): Observable<any>{
    const networkUrl = this._portalApiRoot + `protocollocem/protocolli`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
}
