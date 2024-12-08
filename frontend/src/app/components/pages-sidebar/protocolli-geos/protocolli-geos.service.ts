import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {ProtocolliGeosDto} from "./protocolli-geos-dto";
@Injectable({
  providedIn: 'root'
})
export class ProtocolliGeosService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getProtocolliGeos(): Observable<ProtocolliGeosDto[]> {
    const networkUrl = this._portalApiRoot + `protocollogeos`;
    return this.http
        .get<BaseResponse<ProtocolliGeosDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }

  deleteSelectedDataProtocolliGeos(idprot: any): Observable<any> {
    const networkUrl = `${this._portalApiRoot}protocolligeos/single?idprot=${idprot}`;
    return this.http.delete<any>(networkUrl, {});
  }
  deletemultipleSelectedDatasProtocolliGeos(idprots: number[]): Observable<any> {
    const networkUrl = `${this._portalApiRoot}protocolligeos/multiple`;
    return this.http.delete<any>(networkUrl, { body: idprots });
  }

  sensoSelectboxValuesProtocolliGeos(): Observable<any>{
    const networkUrl = this._portalApiRoot + `senso`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
}
