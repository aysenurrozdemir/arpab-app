import {Component, OnInit, ViewChild} from '@angular/core';
import { UploadService } from './upload-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import {Router} from "@angular/router";

@Component({
    selector: 'app-importa-protollo-geos',
    templateUrl: './importa-protollo-geos.component.html',
    styleUrls: ['./importa-protollo-geos.component.css'],
})
export class ImportaProtolloGeosComponent implements OnInit{
    @ViewChild('fileInput') fileInput: any;
    uploadedFiles: any[] = [];
    filesToUpload: File[] = [];
    isLoading: boolean = false;

    constructor(
        private uploadService: UploadService,
        private messageService: MessageService,
        private router: Router,
    ) {

    }

    ngOnInit(): void {
    }

    onFileSelect(event: any) {
        this.filesToUpload = Array.from(event.target.files);
        this.uploadedFiles.push(...this.filesToUpload);
    }

    uploadFiles() {
        if (this.filesToUpload.length === 0) {
            console.log('No files selected.');
            return;
        }

        for (const file of this.filesToUpload) {
            this.isLoading = true;
            this.uploadFileToServer(file);
        }
    }

    uploadFileToServer(file: File) {
        this.uploadService.uploadFile(file).subscribe(
            res => {
                // Successo
                if(res){
                    this.isLoading = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successo',
                        detail: 'File importato correttamente'
                    });
                    this.uploadedFiles = [];
                }
            },
            err => {
                this.isLoading = false;
                let errorMessage = 'Errore nel caricamento dei dati';
    
                if (err.error && err.error.error) {
                    // Se l'API ha restituito un messaggio di errore specifico
                    errorMessage = err.error.error;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Errore',
                    detail: errorMessage
                });

                this.uploadedFiles = [];
            }
        );
    }
    
    deleteFile(index: number) {
        this.uploadedFiles.splice(index, 1);
    }

    goDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
    goProtocolliGeos(): void {
        this.router.navigate(['/protocollogeos']);
    }
}
