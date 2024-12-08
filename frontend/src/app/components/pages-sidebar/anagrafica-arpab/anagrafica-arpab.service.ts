import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {AnagraficaArpabDto} from "./anagrafica-arpab-dto";

@Injectable({
  providedIn: 'root'
})
export class AnagraficaArpabService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getAnagraficaArpabData(): Observable<AnagraficaArpabDto[]> {
    const networkUrl = this._portalApiRoot + `anaarpab`;
    return this.http
        .get<BaseResponse<AnagraficaArpabDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewAnagraficaArpabData(dtoOut: AnagraficaArpabDto): Observable<AnagraficaArpabDto> {
    const networkUrl = this._portalApiRoot + `anaarpab`;
    return this.http.post<AnagraficaArpabDto>(networkUrl, {fields:dtoOut});
  }
  putUpdatedOneDataAnagraficaArpab(id_ana: any, dtoOut: AnagraficaArpabDto): Observable<AnagraficaArpabDto> {
    const networkUrl = `${this._portalApiRoot}anaarpab?id_ana=${id_ana}`;
    return this.http.put<AnagraficaArpabDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataAnagraficaArpab(id_ana: any): Observable<any> {
    const primaryKey = 'id_ana';
    const networkUrl = `${this._portalApiRoot}anaarpab/single?primaryKey=${primaryKey}&primaryKeyValue=${id_ana}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasAnagraficaArpab(id_anas: number[]): Observable<any> {
    const primaryKey = 'id_ana';
    const networkUrl = `${this._portalApiRoot}anaarpab/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: id_anas});
  }
}
