import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {StrumentiCemDto} from "./strumenti-cem-dto";

@Injectable({
  providedIn: 'root'
})
export class StrumentiCemService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getStrumenticemData(): Observable<StrumentiCemDto[]> {
    const networkUrl = this._portalApiRoot + `strumenticemAll`;
    return this.http
        .get<BaseResponse<StrumentiCemDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewStrumenticemData(dtoOut: StrumentiCemDto): Observable<StrumentiCemDto> {
    const networkUrl = this._portalApiRoot + `strumenticem`;
    return this.http.post<StrumentiCemDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataStrumenticem(id_stru: any, dtoOut: StrumentiCemDto): Observable<StrumentiCemDto> {
    const networkUrl = `${this._portalApiRoot}strumenticem?id_stru=${id_stru}`;
    return this.http.put<StrumentiCemDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataStrumenticem(id_stru: any): Observable<any> {
    const primaryKey = 'id_stru';
    const networkUrl = `${this._portalApiRoot}strumenticem/single?primaryKey=${primaryKey}&primaryKeyValue=${id_stru}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasStrumenticem(id_strus: number[]): Observable<any> {
    const primaryKey = 'id_stru';
    const networkUrl = `${this._portalApiRoot}strumenticem/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: id_strus});
  }
}
