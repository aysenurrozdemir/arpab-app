import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {SondestrumDto} from "./sondestrum-dto";

@Injectable({
  providedIn: 'root'
})
export class SondestrumService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getSondestrumData(): Observable<SondestrumDto[]> {
    const networkUrl = this._portalApiRoot + `sondestrumAll`;
    return this.http
        .get<BaseResponse<SondestrumDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewSondestrum(dtoOut: SondestrumDto): Observable<SondestrumDto> {
    const networkUrl = this._portalApiRoot + `sondestrum`;
    return this.http.post<SondestrumDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataSondestrum(id_sond: any, dtoOut: SondestrumDto): Observable<SondestrumDto> {
    const networkUrl = `${this._portalApiRoot}sondestrum?id_stru=${id_sond}`;
    return this.http.put<SondestrumDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataSondestrum(id_sond: any): Observable<any> {
    const primaryKey = 'id_sond';
    const networkUrl = `${this._portalApiRoot}sondestrum/single?primaryKey=${primaryKey}&primaryKeyValue=${id_sond}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasSondestrum(id_sonds: number[]): Observable<any> {
    const primaryKey = 'id_sond';
    const networkUrl = `${this._portalApiRoot}sondestrum/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: id_sonds});
  }
}
