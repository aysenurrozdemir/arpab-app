import {Component, Inject} from '@angular/core';
import {DialogTemplate, GenericDialogData, GenericDialogType} from "../../services/dialog.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-warning-component-modal',
  templateUrl: './warning-component-modal.component.html',
  styleUrls: ['./warning-component-modal.component.css']
})
export class WarningComponentModalComponent {

  title: string;
  message: string;
  errorCode: string;

  type: GenericDialogType;
  dialogTemplate: DialogTemplate;

  constructor(
      public dialogRef: MatDialogRef<WarningComponentModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: GenericDialogData
  ) {
    this.title = this.data.title;
    this.message = this.data.message;
    this.errorCode = this.data.errorCode;
    this.type = this.data.type;
    this.dialogTemplate = this.getCustomizedData();
  }


  private getCustomizedData(): DialogTemplate {
    switch (this.type) {
      case GenericDialogType.Error:
        return {
          icon: 'error',
          headerClass: 'text-red-500',
          contentClass: 'border border-red-100 rounded p-4 bg-red-50 text-lg text-red-700'
        };

      case GenericDialogType.Info:
        return {
          icon: 'warning',
          headerClass: 'text-yellow-500',
          contentClass: 'border border-yellow-100 rounded p-4 bg-yellow-50 text-lg text-yellow-700'
        };

      case GenericDialogType.Warning:
        return {
          icon: 'info',
          headerClass: 'text-sky-500',
          contentClass: 'border border-sky-100 rounded p-4 bg-sky-50 text-lg text-sky-700'
        };
    }

  }
}
