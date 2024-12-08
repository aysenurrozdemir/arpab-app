import {NgModule} from '@angular/core';
import {ActivatedRoute, RouterModule, Routes} from '@angular/router';
import {AppLayoutComponent} from "./layout/app.layout.component";
import {LoginComponent} from "./components/login/login.component";
import {AccessComponent} from "./components/auth/access/access.component";
import {ErrorComponent} from "./components/auth/error/error.component";
import {LandingComponent} from "./components/landing/landing.component";
import {NotfoundComponent} from "./components/auth/notfound/notfound.component";
import {ProtocolloCemComponent} from "./components/pages-sidebar/protocollo-cem/protocollo-cem.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {ProtocolliGeosComponent} from "./components/pages-sidebar/protocolli-geos/protocolli-geos.component";
import {CodiceSitoGestoriComponent} from "./components/pages-sidebar/codice-sito-gestori/codice-sito-gestori.component";
import {RilevazioniSitoComponent} from "./components/pages-sidebar/rilevazioni-sito/rilevazioni-sito.component";
import {GestoriCemComponent} from "./components/pages-sidebar/gestori-cem/gestori-cem.component";
import {StrumentiCemComponent} from "./components/pages-sidebar/strumenti-cem/strumenti-cem.component";
import {SondestrumComponent} from "./components/pages-sidebar/sondestrum/sondestrum.component";
import {MisureCemComponent} from "./components/pages-sidebar/misure-cem/misure-cem.component";
import {AuthGuard} from "./core/guard/auth.guard";
import {
  ProtocolliGeos2022Component
} from "./components/pages-sidebar/protocollo-cem/vedi-protocolli-2022/protocolli-geos-2022.component";
import {
  ProtocolliGeos2023Component
} from "./components/pages-sidebar/protocollo-cem/vedi-protocolli-2023/protocolli-geos-2023.component";
import {
  ImportaProtolloGeosComponent
} from "./components/pages-sidebar/importa-protollo-geos/importa-protollo-geos.component";
import {EsportaDocumentiComponent} from "./components/pages-sidebar/esporta-documenti/esporta-documenti.component";
import {ElencoRumoreComponent} from "./components/pages-sidebar/elenco-rumore/elenco-rumore.component";
import {GestoriRumoreComponent} from "./components/pages-sidebar/gestori-rumore/gestori-rumore.component";
import {ElencoUfficioComponent} from "./components/pages-sidebar/elenco-ufficio/elenco-ufficio.component";
import {AnagraficaArpabComponent} from "./components/pages-sidebar/anagrafica-arpab/anagrafica-arpab.component";


// { path: 'login', component: LoginComponent, canActivate: [authGuard]},

const routes: Routes = [
  // { path: '', component: AppComponent },
  {
    path: '', component: AppLayoutComponent,
    children: [
      {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
      {path: 'protocollocem', component: ProtocolloCemComponent, canActivate: [AuthGuard] },
      {path: 'protocollocem2022', component: ProtocolliGeos2022Component, canActivate: [AuthGuard] },
      {path: 'protocollocem2023', component: ProtocolliGeos2023Component, canActivate: [AuthGuard] },
      {path: 'protocollogeos', component: ProtocolliGeosComponent, canActivate: [AuthGuard] },
      {path: 'codicesitogestori', component: CodiceSitoGestoriComponent, canActivate: [AuthGuard]},
      {path: 'elencogestorirumcem', component: ElencoRumoreComponent, canActivate: [AuthGuard]},
      {path: 'elencogestoriufficio', component: ElencoUfficioComponent, canActivate: [AuthGuard]},
      {path: 'gestorirum', component: GestoriRumoreComponent, canActivate: [AuthGuard]},
      {path: 'anaarpab', component: AnagraficaArpabComponent, canActivate: [AuthGuard]},
      {path: 'rilevazionisito', component: RilevazioniSitoComponent, canActivate: [AuthGuard]},
      {path: 'gestori', component: GestoriCemComponent, canActivate: [AuthGuard] },
      {path: 'strumenticem', component: StrumentiCemComponent, canActivate: [AuthGuard] },
      {path: 'sondestrum', component: SondestrumComponent, canActivate: [AuthGuard] },
      {path: 'misurecemrf', component: MisureCemComponent, canActivate: [AuthGuard]},
      {path: 'importdoc', component: ImportaProtolloGeosComponent, canActivate: [AuthGuard]},
      {path: 'exportdoc', component: EsportaDocumentiComponent, canActivate: [AuthGuard]}
    ]
  },
  {path: 'login', component: LoginComponent},
  {path: 'access', component: AccessComponent},
  {path: 'error', component: ErrorComponent},
  {path: 'landing', component: LandingComponent},
  {path: 'notFound', component: NotfoundComponent},

  // { path: '**', redirectTo: '/notfound'},
  {path: '**', redirectTo: 'login'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
