import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {WarningComponentModalComponent} from "../modals/warning-component-modal/warning-component-modal.component";

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    constructor(
        private dialog: MatDialog,
        private ngZone: NgZone
    ) {
    }

    openError(message: string, errorCode?: string): MatDialogRef<WarningComponentModalComponent> {
        return this.ngZone.run(() => {
            return this.dialog.open<WarningComponentModalComponent, GenericDialogData>(WarningComponentModalComponent, {
                restoreFocus: false,
                autoFocus: true,
                panelClass: 'custom-dialog-container',
                data: {
                    title: 'Error',
                    message,
                    errorCode,
                    type: GenericDialogType.Error
                }
            });
        });
    }


}
export class DialogTemplate {
    icon: string;
    headerClass: string;
    contentClass: string;
}
export class GenericDialogData {
    title: string;
    message: string;
    errorCode: string;
    type: GenericDialogType;
}
export enum GenericDialogType {
    Error,
    Warning,
    Info
}
