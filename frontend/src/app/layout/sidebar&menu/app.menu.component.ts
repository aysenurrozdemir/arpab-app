import {Component, HostListener, OnInit} from '@angular/core';
import {LayoutService} from "../app.layout.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
    providers: []
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    isWideScreen: boolean;
    constructor(public layoutService: LayoutService,
                private router: Router) {
        this.checkWindowWidth();
    }

    ngOnInit() {
        this.checkWindowWidth();
        this.model = [

            {
                items: [
                    {
                        label: 'PROTOCOLLI', icon: 'pi pi-home',
                        items: [
                            {
                                label: 'Protocolli', icon: 'pi pi-fw pi-pencil', routerLink: ['/protocollocem']
                            },
                            {
                                label: 'Protocolli 2022', icon: 'pi pi-fw pi-pencil', routerLink: ['/protocollocem2022']
                            },
                            {
                                label: 'Protocolli 2023', icon: 'pi pi-fw pi-pencil', routerLink: ['/protocollocem2023']
                            },
                            {
                                label: 'Vedi Protocolli GEOS', icon: 'pi pi-fw pi-pencil', routerLink: ['/protocollogeos']
                            },

                        ]
                    },
                    {
                        label: 'GESTORI', icon: 'pi pi-home',
                        items: [
                            {
                                label: 'Catasto Sito Gestori CEM', icon: 'pi pi-fw pi-pencil', routerLink: ['codicesitogestori']
                            },
                            {
                                label: 'Scheda RadioElettrica', icon: 'pi pi-fw pi-pencil', routerLink: ['rilevazionisito']
                            },
                            {
                                label: 'Gestori CEM', icon: 'pi pi-fw pi-pencil', routerLink: ['gestori']
                            },
                            {
                                label: 'Elenco RUMORE/RUMORE CEM', icon: 'pi pi-fw pi-pencil', routerLink: ['elencogestorirumcem']
                            },
                            {
                                label: 'Gestori RUMORE', icon: 'pi pi-fw pi-pencil', routerLink: ['gestorirum']
                            },
                            {
                                label: 'Elenco Gestori Ufficio', icon: 'pi pi-fw pi-pencil', routerLink: ['elencogestoriufficio']
                            },
                        ]

                    },
                    {
                        label: 'MISURAZIONI', icon: 'pi pi-home',
                        items: [
                            {
                                label: 'Misure CEM', icon: 'pi pi-fw pi-pencil', routerLink: ['misurecemrf']
                            },
                            {
                                label: 'Sondestrum', icon: 'pi pi-fw pi-pencil', routerLink: ['sondestrum']
                            },
                            {
                                label: 'Strumenticem', icon: 'pi pi-fw pi-pencil', routerLink: ['strumenticem']
                            },
                        ]
                    },
                    {
                        label: 'ANAGRAFICHE', icon: 'pi pi-home',
                        items: [
                            {
                                label: 'Anagrafica ARPAB', icon: 'pi pi-fw pi-pencil', routerLink: ['anaarpab']
                            },
                        ]
                    },
                    {
                        label: 'ESPORTA DOCUMENTI', icon: 'pi pi-home',
                        items: [
                            {
                                label: 'SCEGLI IL DOCUMENTO DA CREARE', icon: 'pi pi-fw pi-pencil', routerLink: ['exportdoc']
                            },
                        ]
                    },
                    {
                        label: 'IMPORTA PROTOCOLLI GEOS', icon: 'pi pi-home',
                        items: [
                            {
                                label: 'IMPORTA PROTOCOLLO GEOS', icon: 'pi pi-fw pi-pencil', routerLink: ['importdoc']
                            },
                        ]
                    }
                ]
            }
        ];
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.checkWindowWidth();
    }

    checkWindowWidth() {
        this.isWideScreen = window.innerWidth > 991;
    }
}
