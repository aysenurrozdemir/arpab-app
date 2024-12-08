import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {ElencoUfficioDto} from "./elenco-ufficio-dto";

@Injectable({
  providedIn: 'root'
})
export class ElencoUfficioService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getElencoGestoriUfficioData(): Observable<ElencoUfficioDto[]> {
    const networkUrl = this._portalApiRoot + `elencogestoriufficioAll`;
    return this.http
        .get<BaseResponse<ElencoUfficioDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewElencoGestoriUfficioData(dtoOut: ElencoUfficioDto): Observable<ElencoUfficioDto> {
    const networkUrl = this._portalApiRoot + `elencogestoriufficio`;
    return this.http.post<ElencoUfficioDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataElencoGestoriUfficio(numcodprog: any, dtoOut: ElencoUfficioDto): Observable<ElencoUfficioDto> {
    const networkUrl = `${this._portalApiRoot}elencogestoriufficio?numcodprog=${numcodprog}`;
    return this.http.put<ElencoUfficioDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataElencoGestoriUfficio(numcodprog: any): Observable<any> {
    const primaryKey = 'numcodprog';
    const networkUrl = `${this._portalApiRoot}elencogestoriufficio/single?primaryKey=${primaryKey}&primaryKeyValue=${numcodprog}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasElencoGestoriUfficio(numcodprogs: number[]): Observable<any> {
    const primaryKey = 'numcodprog';
    const networkUrl = `${this._portalApiRoot}elencogestoriufficio/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: numcodprogs});
  }

}
