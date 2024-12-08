import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {ElencoRumoreDto} from "./elenco-rumore-dto";

@Injectable({
  providedIn: 'root'
})
export class ElencoRumoreService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getElencoGestoriRumcemData(): Observable<ElencoRumoreDto[]> {
    const networkUrl = this._portalApiRoot + `elencogestorirumcemAll`;
    return this.http
        .get<BaseResponse<ElencoRumoreDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewElencoGestoriRumcemData(dtoOut: ElencoRumoreDto): Observable<ElencoRumoreDto> {
    const networkUrl = this._portalApiRoot + `elencogestorirumcem`;
    return this.http.post<ElencoRumoreDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataElencoGestoriRumcem(numcodcar: any, dtoOut: ElencoRumoreDto): Observable<ElencoRumoreDto> {
    const networkUrl = `${this._portalApiRoot}elencogestorirumcem?numcodcar=${numcodcar}`;
    return this.http.put<ElencoRumoreDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataElencoGestoriRumcem(numcodcar: any): Observable<any> {
    const primaryKey = 'numcodcar';
    const networkUrl = `${this._portalApiRoot}elencogestorirumcem/single?primaryKey=${primaryKey}&primaryKeyValue=${numcodcar}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasElencoGestoriRumcem(numcodcars: number[]): Observable<any> {
    const primaryKey = 'numcodcar';
    const networkUrl = `${this._portalApiRoot}elencogestorirumcem/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: numcodcars});
  }


  radioSchedaObbValuesCodiceSitoGestori(numcodsito: string): Observable<any> {
    const networkUrl = this._portalApiRoot + `rilevazionisito/${numcodsito}`;
    return this.http.get<any>(networkUrl);
  }

  regioneSelectboxValues(): Observable<any>{
    const networkUrl = this._portalApiRoot + `gi_regioni/regione`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  provinciaSelectboxValues(regioneCode: string): Observable<any[]> {
    const networkUrl = `${this._portalApiRoot}gi_province/provincia/${regioneCode}`;
    return this.http.get<BaseResponse<any[]>>(networkUrl).pipe(map(m => m.data));
  }

  comuneSelectboxValuesCodiceSitoGestori(provinciaCode: string): Observable<any[]> {
    const networkUrl = `${this._portalApiRoot}gi_comuni/comune/${provinciaCode}`;
    return this.http.get<BaseResponse<any[]>>(networkUrl).pipe(map(m => m.data));
  }
}
