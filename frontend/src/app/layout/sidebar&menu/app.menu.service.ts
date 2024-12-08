import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MenuChangeEvent } from "../api/menuchangeevent";

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    private menuSource = new Subject<MenuChangeEvent>();
    menuSource$ = this.menuSource.asObservable();
    private resetSource = new Subject();
    resetSource$ = this.resetSource.asObservable();

    private readonly LAST_ACTIVE_PATH_KEY = 'lastActivePath';
    private lastActivePaths: string[] = [];

    onMenuStateChange(event: MenuChangeEvent) {
        if (event.routeEvent) {
            this.menuSource.next(event);
            localStorage.setItem(this.LAST_ACTIVE_PATH_KEY, JSON.stringify(event.key));
        } else {
            this.lastActivePaths = this.lastActivePaths.filter(key => !key.startsWith(event.key + '-'));
            this.menuSource.next(event);
        }
    }


    getLastActivePath(): string | null {
        return JSON.parse(localStorage.getItem(this.LAST_ACTIVE_PATH_KEY) || 'null');
    }
}
