import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ProtocolliGeos2023Dto} from "./protocolli-geos-2023-dto";
import {environment} from "../../../../../environments/environment";
import {BaseResponse} from "../../../../core/models/base-response";
@Injectable({
  providedIn: 'root'
})
export class ProtocolliGeos2023Service {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getProtocolliGeos2023(): Observable<ProtocolliGeos2023Dto[]> {
    const networkUrl = this._portalApiRoot + `protocollocem2023`;
    return this.http
        .get<BaseResponse<ProtocolliGeos2023Dto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  // postSaveNewProtocolliGeosData(dtoOut: ProtocolliGeos2022Dto): Observable<ProtocolliGeos2022Dto> {
  //   const networkUrl = this._portalApiRoot + `protocolligeos`;
  //   return this.http.post<ProtocolliGeos2022Dto>(networkUrl, dtoOut);
  // }
  // putUpdatedOneDataProtocolliGeos(idprot: number, dtoOut: ProtocolliGeos2022Dto): Observable<ProtocolliGeos2022Dto> {
  //   const networkUrl = `${this._portalApiRoot}protocolligeos?idprot=${idprot}`;
  //   return this.http.put<ProtocolliGeos2022Dto>(networkUrl, dtoOut);
  // }
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
