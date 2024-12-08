import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {GestoriCemDto} from "./gestori-cem-dto";

@Injectable({
  providedIn: 'root'
})
export class GestoriCemService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getGestoriCemData(): Observable<GestoriCemDto[]> {
    const networkUrl = this._portalApiRoot + `gestoriAll`;
    return this.http
        .get<BaseResponse<GestoriCemDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewGestoriCemData(dtoOut: GestoriCemDto): Observable<GestoriCemDto> {
    const networkUrl = this._portalApiRoot + `gestori`;
    return this.http.post<GestoriCemDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataGestoriCem(idgestore: any, dtoOut: GestoriCemDto): Observable<GestoriCemDto> {
    const networkUrl = `${this._portalApiRoot}gestori?idgestore=${idgestore}`;
    return this.http.put<GestoriCemDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataGestoriCem(idgestore: any): Observable<any> {
    const primaryKey = 'idgestore';
    const networkUrl = `${this._portalApiRoot}gestori/single?primaryKey=${primaryKey}&primaryKeyValue=${idgestore}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasGestoriCem(idgestores: number[]): Observable<any> {
    const primaryKey = 'idgestore';
    const networkUrl = `${this._portalApiRoot}gestori/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: idgestores});
  }
}
