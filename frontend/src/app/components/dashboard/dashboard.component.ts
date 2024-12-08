import { Component, OnInit } from '@angular/core';
import {MessageService} from "primeng/api";
import {AuthorizationService} from "../../core/services/authorization.service";
interface UploadEvent {
    originalEvent: Event;
    files: File[];
}
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    providers: [MessageService]
})
export class DashboardComponent implements OnInit {

    constructor(private messageService: MessageService,
                private authService: AuthorizationService) {
    }

    ngOnInit() {
    }
    onUpload(event: UploadEvent) {
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
    }
    openExternalLinkCalendar() {
        window.open('https://trello.com/b/iNuHFUrR/arpab-demo', '_blank', 'noopener noreferrer');
    }
    openExternalLinkDashboard1() {
        window.open('https://demos.creative-tim.com/now-ui-dashboard/examples/dashboard.html?_ga=2.12581492.1950508500.1683580143-1395809351.1683580143', '_blank', 'noopener noreferrer');
    }
    private readonly LAST_ACTIVE_PATH_KEY = 'lastActivePath';
    logout(): void {
        const lastActivePath = JSON.parse(localStorage.getItem(this.LAST_ACTIVE_PATH_KEY) || 'null');
        localStorage.setItem(this.LAST_ACTIVE_PATH_KEY, '');
        return this.authService.removeAuthentication();
    }
}
