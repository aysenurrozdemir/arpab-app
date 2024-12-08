import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LOCALE_ID, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';
import {TableCheckbox, TableModule} from 'primeng/table';
import {DialogModule} from 'primeng/dialog';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DropdownModule} from 'primeng/dropdown';
import {RadioButtonModule} from 'primeng/radiobutton';
import {RatingModule} from 'primeng/rating';
import {ToolbarModule} from 'primeng/toolbar';
import {PanelModule} from "primeng/panel";
import {FileUploadModule} from "primeng/fileupload";
import {OrderListModule} from "primeng/orderlist";
import {DividerModule} from "primeng/divider";
import {AppRoutingModule} from "./app-routing.module";
import {CardModule} from 'primeng/card';
import {CheckboxModule} from "primeng/checkbox";
import {CalendarModule} from "primeng/calendar";
import {MultiSelectModule} from "primeng/multiselect";
import {SplitterModule} from "primeng/splitter";
import {GMapModule} from "primeng/gmap";
import {CommonModule, NgClass} from "@angular/common";
import {SidebarModule} from "primeng/sidebar";
import {BadgeModule} from "primeng/badge";
import {InputSwitchModule} from "primeng/inputswitch";
import {RippleModule} from "primeng/ripple";
import {RouterLink, RouterLinkActive, RouterModule} from "@angular/router";


import {MenuService} from "./layout/sidebar&menu/app.menu.service";
import {ConfirmationService, MessageService} from 'primeng/api';
import {LayoutService} from "./layout/app.layout.service";

import {AppComponent} from "./app.component";
import {AccessComponent} from "./components/auth/access/access.component";
import {ErrorComponent} from "./components/auth/error/error.component";
import {LoginComponent} from "./components/login/login.component";
import {LandingComponent} from "./components/landing/landing.component";
import {NotfoundComponent} from "./components/auth/notfound/notfound.component";
import {AppLayoutComponent} from "./layout/app.layout.component";
import {AppFooterComponent} from "./layout/footer/app.footer.component";
import {AppSidebarComponent} from "./layout/sidebar&menu/app.sidebar.component";
import {AppMenuComponent} from "./layout/sidebar&menu/app.menu.component";
import {AppMenuitemComponent} from "./layout/sidebar&menu/app.menuitem.component";
import {AppTopBarComponent} from "./layout/topbar/app.topbar.component";
import {ProtocolloCemComponent} from "./components/pages-sidebar/protocollo-cem/protocollo-cem.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {ProtocolliGeosComponent} from "./components/pages-sidebar/protocolli-geos/protocolli-geos.component";
import {CodiceSitoGestoriComponent} from "./components/pages-sidebar/codice-sito-gestori/codice-sito-gestori.component";
import {RilevazioniSitoComponent} from "./components/pages-sidebar/rilevazioni-sito/rilevazioni-sito.component";
import {GestoriCemComponent} from "./components/pages-sidebar/gestori-cem/gestori-cem.component";
import {StrumentiCemComponent} from "./components/pages-sidebar/strumenti-cem/strumenti-cem.component";
import {SondestrumComponent} from "./components/pages-sidebar/sondestrum/sondestrum.component";
import {MisureCemComponent} from "./components/pages-sidebar/misure-cem/misure-cem.component";
import {MultipleValueFormatPipe} from "./components/pages-sidebar/protocollo-cem/multiple-value-format.pipe";
import {MessagesModule} from "primeng/messages";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MessageModule} from "primeng/message";
import {MatIconModule} from "@angular/material/icon";
import {ToastModule} from "primeng/toast";
import { WarningComponentModalComponent } from './core/modals/warning-component-modal/warning-component-modal.component';
import {
    ProtocolliGeos2022Component
} from "./components/pages-sidebar/protocollo-cem/vedi-protocolli-2022/protocolli-geos-2022.component";
import {
    ProtocolliGeos2023Component
} from "./components/pages-sidebar/protocollo-cem/vedi-protocolli-2023/protocolli-geos-2023.component";
import { TranslateFilterDirective } from './core/translate-filter.directive';
import { ImportaProtolloGeosComponent } from './components/pages-sidebar/importa-protollo-geos/importa-protollo-geos.component';
import {EsportaDocumentiComponent} from "./components/pages-sidebar/esporta-documenti/esporta-documenti.component";
import {TooltipModule} from "primeng/tooltip";
import {ScrollPanelModule} from "primeng/scrollpanel";
import {ElencoRumoreComponent} from "./components/pages-sidebar/elenco-rumore/elenco-rumore.component";
import {GestoriRumoreComponent} from "./components/pages-sidebar/gestori-rumore/gestori-rumore.component";
import {ElencoUfficioComponent} from "./components/pages-sidebar/elenco-ufficio/elenco-ufficio.component";
import {AnagraficaArpabComponent} from "./components/pages-sidebar/anagrafica-arpab/anagrafica-arpab.component";

@NgModule({
    declarations: [
        AppComponent,
        AccessComponent,
        ErrorComponent,
        LoginComponent,
        LandingComponent,
        NotfoundComponent,
        AppLayoutComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppSidebarComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        ProtocolloCemComponent,
        ProtocolliGeos2022Component,
        ProtocolliGeos2023Component,
        DashboardComponent,
        ProtocolliGeosComponent,
        CodiceSitoGestoriComponent,
        RilevazioniSitoComponent,
        GestoriCemComponent,
        ElencoRumoreComponent,
        GestoriRumoreComponent,
        ElencoUfficioComponent,
        AnagraficaArpabComponent,
        StrumentiCemComponent,
        SondestrumComponent,
        MisureCemComponent,
        MultipleValueFormatPipe,
        WarningComponentModalComponent,
        TranslateFilterDirective,
        ImportaProtolloGeosComponent,
        EsportaDocumentiComponent

    ],
    imports: [
        AppRoutingModule,
        RouterLink,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        TableModule,
        HttpClientModule,
        InputTextModule,
        DialogModule,
        ToolbarModule,
        ConfirmDialogModule,
        RatingModule,
        InputNumberModule,
        InputTextareaModule,
        RadioButtonModule,
        DropdownModule,
        ButtonModule,
        CommonModule,
        RouterModule,
        SidebarModule,
        BadgeModule,
        InputSwitchModule,
        RippleModule,
        NgClass,
        RouterLinkActive,
        ReactiveFormsModule,
        CardModule,
        CheckboxModule,
        CalendarModule,
        MultiSelectModule,
        HttpClientJsonpModule,
        SplitterModule,
        GMapModule,
        PanelModule,
        FileUploadModule,
        OrderListModule,
        DividerModule,
        MessagesModule,
        MatSnackBarModule,
        MatDialogModule,
        MatButtonModule,
        MessagesModule,
        MessageModule,
        MatIconModule,
        ToastModule,
        TooltipModule,
        ScrollPanelModule
    ],
    providers: [
        ConfirmationService,
        LayoutService,
        MessageService, MenuService,
        // { provide: LOCALE_ID, useValue: 'it' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
