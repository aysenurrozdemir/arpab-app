import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {RilevazioniSitoDto} from "./rilevazioni-sito-dto";

@Injectable({
  providedIn: 'root'
})
export class RilevazioniSitoService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getRilevazioniSitoData(): Observable<RilevazioniSitoDto[]> {
    const networkUrl = this._portalApiRoot + `rilevazionisitoAll`;
    return this.http
        .get<BaseResponse<RilevazioniSitoDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewRilevazioniSitoData(dtoOut: RilevazioniSitoDto): Observable<RilevazioniSitoDto> {
    const networkUrl = this._portalApiRoot + `rilevazionisito`;
    return this.http.post<RilevazioniSitoDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataRilevazioniSito(idmisurazione: any, dtoOut: RilevazioniSitoDto): Observable<RilevazioniSitoDto> {
    const networkUrl = `${this._portalApiRoot}rilevazionisito?idmisurazione=${idmisurazione}`;
    return this.http.put<RilevazioniSitoDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataRilevazioniSito(idmisurazione: any): Observable<any> {
    const primaryKey = 'idmisurazione';
    const networkUrl = `${this._portalApiRoot}rilevazionisito/single?primaryKey=${primaryKey}&primaryKeyValue=${idmisurazione}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasRilevazioniSito(idmisuraziones: number[]): Observable<any> {
    const primaryKey = 'idmisurazione';
    const networkUrl = `${this._portalApiRoot}rilevazionisito/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: idmisuraziones});
  }
  numcodsitoSelectboxValuesRilevazioniSito(): Observable<any>{
    const networkUrl = this._portalApiRoot + `codicesitogestori/numcodsito`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
}
