import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {BaseResponse} from "../../../core/models/base-response";
import {ProtocolloCemDto} from "./protocollo-cem-dto";
import {CodiceSitoGestoriPopUpDto} from "../codice-sito-gestori/codice-sito-gestori-dto";
import {ElencoRumoreDto} from "../elenco-rumore/elenco-rumore-dto";
import {ElencoUfficioDto} from "../elenco-ufficio/elenco-ufficio-dto";

@Injectable({
  providedIn: 'root'
})
export class ProtocolloCemService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

  getProtocolloCemData(): Observable<ProtocolloCemDto[]> {
    const networkUrl = this._portalApiRoot + `protocollocem`;
    return this.http
        .get<BaseResponse<ProtocolloCemDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  getElencoRumoreForClickedPopup(numcodcar: any): Observable<ElencoRumoreDto[]> {
    const networkUrl = this._portalApiRoot + `elencogestorirumcem/n/${numcodcar}`;
    return this.http
        .get<BaseResponse<ElencoRumoreDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  getElencoUffForClickedPopup(numcodprog: any): Observable<ElencoUfficioDto[]> {
    const networkUrl = this._portalApiRoot + `elencogestoriufficio/n/${numcodprog}`;
    return this.http
        .get<BaseResponse<ElencoUfficioDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  getCodiceSitoGestoriForClickedPopup(siteCode: any): Observable<CodiceSitoGestoriPopUpDto[]> {
    const networkUrl = this._portalApiRoot + `codicesitogestori/n/${siteCode}`;
    return this.http
        .get<BaseResponse<CodiceSitoGestoriPopUpDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  getProtocolloForClickedPopup(protocollo: any): Observable<ProtocolloCemDto[]> {
    const networkUrl = this._portalApiRoot + `protocollocem/p/${protocollo}`;
    return this.http
        .get<BaseResponse<ProtocolloCemDto[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  postSaveNewProtocolloCemData(dtoOut: ProtocolloCemDto): Observable<ProtocolloCemDto> {
    const networkUrl = this._portalApiRoot + `protocollocem`;
    return this.http.post<ProtocolloCemDto>(networkUrl,{fields:dtoOut});
  }
  putUpdatedOneDataProtocolloCem(idprot: number, dtoOut: ProtocolloCemDto): Observable<ProtocolloCemDto> {
    const networkUrl = `${this._portalApiRoot}protocollocem?idprot=${idprot}`;
    return this.http.put<ProtocolloCemDto>(networkUrl, {fields:dtoOut});
  }
  deleteSelectedDataProtocolloCem(idField: any): Observable<any> {
    const primaryKey = 'idprot';
    const networkUrl = `${this._portalApiRoot}protocollocem/single?primaryKey=${primaryKey}&primaryKeyValue=${idField}`;
    return this.http.delete<any>(networkUrl);
  }
  deletemultipleSelectedDatasProtocolloCem(idFields: number[]): Observable<any> {
    const primaryKey = 'idprot';
    const networkUrl = `${this._portalApiRoot}protocollocem/multiple?primaryKey=${primaryKey}`;
    return this.http.delete<any>(networkUrl, { body: idFields });
  }
  sensoSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `senso`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  numprotcollSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `protocollocem/protocolli`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  subassegnazioneSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `operatori`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  tematicaSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `tematiche`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  categoriaSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `catcem`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  catRumSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `catrum`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  catUffSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `catuff`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatcemSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatcem`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatcem1SelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatcem1`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatcem2SelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatcem2`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatcem3SelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatcem3`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatcem4SelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatcem4`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatRumSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatrum`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  sottcatUffSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `sottcatuff`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  azioneSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `classifcem`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  protriferimeSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `protriferime`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  numcodsitoSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `codicesitogestori/numcodsito`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  elencorumoreSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `elencogestorirumcem/numcodcar`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  elencoufficioSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `elencogestoriufficio/numcodprog`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  statoimpiantoSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `statoimpianto`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
  statoproceduraSelectboxValuesProtocolloCem(): Observable<any>{
    const networkUrl = this._portalApiRoot + `statoprocedura`;
    return this.http
        .get<BaseResponse<any[]>>(networkUrl)
        .pipe(map((m) => m.data));
  }
}
