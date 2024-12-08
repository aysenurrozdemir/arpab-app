import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {LayoutService} from "../app.layout.service";
import {Router} from "@angular/router";
import {AuthorizationService} from "../../core/services/authorization.service";

@Component({
    selector: 'app-topbar',
    providers: [],
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent {
    items!: MenuItem[];
    username: any;
    userName = JSON.parse(localStorage.getItem('userName'));
    isWideScreen: boolean;
    isWideScreenProfileSidebar: boolean;
    showProfileSidebarCheck: boolean = false;
    showOverlay: boolean = false;
    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService, private authService: AuthorizationService) {
    }
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.checkWindowWidth();
        this.checkWindowWidthProfileSidebar();
    }

    checkWindowWidth() {
        this.isWideScreen = window.innerWidth > 991;
    }
    checkWindowWidthProfileSidebar() {
        this.isWideScreenProfileSidebar = window.innerWidth < 991;
    }
    logout(): void {
        return this.authService.removeAuthentication();
    }
    showProfileSidebar(): void {
        this.showProfileSidebarCheck = !this.showProfileSidebarCheck;
        if (this.showProfileSidebarCheck) {
            this.showOverlay = true;
        }else{
            this.showOverlay = false;
        }
    }
}
