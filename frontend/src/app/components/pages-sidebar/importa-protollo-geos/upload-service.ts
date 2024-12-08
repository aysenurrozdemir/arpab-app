import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {FileUpload} from "primeng/fileupload";

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private _portalApiRoot = `${environment.apiRoot}`;
  constructor(private http: HttpClient) { }

    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        const networkUrl = `${this._portalApiRoot}/upload`;
        return this.http.post<any>(networkUrl, formData);
    }
}
