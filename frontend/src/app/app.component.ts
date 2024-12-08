import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthorizationService} from "./core/services/authorization.service";
import {TranslateFilterDirective} from "./core/translate-filter.directive";
import {PrimeNGConfig} from "primeng/api";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [TranslateFilterDirective]
})
export class AppComponent implements OnInit {

    constructor(private router: Router, private authService: AuthorizationService, private primeNGConfig: PrimeNGConfig){}
    ngOnInit() {
        let it = {
            "monthNames": ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            "dayNamesMin": ["Do","Lu","Ma","Me","Gi","Ve","Sa"],
            "monthNamesShort": ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu","Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
        }
        this.primeNGConfig.setTranslation(it);
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/login']);
        }
    }
}
