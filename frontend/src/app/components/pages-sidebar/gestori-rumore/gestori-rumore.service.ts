import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {GestoriRumoreDto} from "./gestori-rumore-dto";

@Injectable({
  providedIn: 'root'
})
export class GestoriRumoreService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getGestorirumCemData(): Observable<GestoriRumoreDto[]> {
    const networkUrl = this._portalApiRoot + `gestorirumAll`;
    return this.http
        .get<BaseResponse<GestoriRumoreDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewGestorirumData(dtoOut: GestoriRumoreDto): Observable<GestoriRumoreDto> {
    const networkUrl = this._portalApiRoot + `gestorirum`;
    return this.http.post<GestoriRumoreDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataGestorirum(idgestore: any, dtoOut: GestoriRumoreDto): Observable<GestoriRumoreDto> {
    const networkUrl = `${this._portalApiRoot}gestorirum?idgestore=${idgestore}`;
    return this.http.put<GestoriRumoreDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataGestorirum(idgestore: any): Observable<any> {
    const primaryKey = 'idgestore';
    const networkUrl = `${this._portalApiRoot}gestorirum/single?primaryKey=${primaryKey}&primaryKeyValue=${idgestore}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasGestorirum(idgestores: number[]): Observable<any> {
    const primaryKey = 'idgestore';
    const networkUrl = `${this._portalApiRoot}gestorirum/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: idgestores});
  }
}
