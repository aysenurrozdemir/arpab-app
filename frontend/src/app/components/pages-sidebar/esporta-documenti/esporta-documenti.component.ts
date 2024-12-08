import { Component, ViewChild } from '@angular/core';
import { EsportaDocumentiService } from './esporta-documenti-service';
import { ConfirmationService, MessageService } from 'primeng/api';

interface UploadEvent {
    originalEvent: Event;
    files: File[];
}

@Component({
    selector: 'app-esporta-documenti',
    templateUrl: './esporta-documenti.component.html',
    styleUrls: ['./esporta-documenti.component.css'],
})
export class EsportaDocumentiComponent {
    numeroProtocollo: any;
    numeroCodiceSito: any;
    numeroCodiceSitoPerSoprolluogo: any;
    numeroCodiceSitoPerVincolata: any;
    numeroCodiceSitoPerRichiesta: any;
    codiceSitoPerRapportoDiMisura: any;
    fatturazioneDaCompletare: any;
    constructor(
        private esportaDocumentiService: EsportaDocumentiService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}
    downloadFile(base64Data: string, fileName: string, fileType: string) {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: fileType });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }

    downloadNumeroProtocolloFile(numeroProtocollo: any) {
        this.esportaDocumentiService.downloadNumeroProtocolloFile(numeroProtocollo).subscribe(res => {
            if (res && res.base64Data) {
                const base64Data = res.base64Data;
                const fileName = res.fileName || 'document.docx';
                const fileType = res.fileType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                this.downloadFile(base64Data, fileName, fileType);
                this.messageService.add({severity: 'success', summary: 'Successo', detail: 'File scaricato con successo'});
            } else {
                this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore durante il download del file'});
            }
        }, error => {
            this.messageService.add({severity: 'error', summary: 'Errore', detail: 'Errore durante il download del file'});
        });
    }
    downloadNumeroCodiceSitoFile(numeroCodiceSito: any) {
        this.esportaDocumentiService.downloadNumeroCodiceSitoFile(numeroCodiceSito).subscribe(res => {
            const base64Data = res.base64Data;
            const fileName = res.fileName;
            const fileType = res.fileType;
            this.downloadFile(base64Data, fileName, fileType);
            this.confirmationService.confirm({
                message: 'Downloaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
            this.confirmationService.confirm({
                message: 'File uploaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        }, error => {
            this.confirmationService.confirm({
                message: 'Failed to download',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        })
    }
    downloadNumeroCodiceSitoPerSoprolluogoFile(numeroCodiceSitoPerSoprolluogo: any) {
        this.esportaDocumentiService.downloadNumeroCodiceSitoPerSoprolluogoFile(numeroCodiceSitoPerSoprolluogo).subscribe(res => {
            const base64Data = res.base64Data;
            const fileName = res.fileName;
            const fileType = res.fileType;
            this.downloadFile(base64Data, fileName, fileType);
            this.confirmationService.confirm({
                message: 'File uploaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        }, error => {
            this.confirmationService.confirm({
                message: 'Failed to download',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        })
    }
    downloadNumeroCodiceSitoPerVincolataFile(numeroCodiceSitoPerVincolata: any) {
        this.esportaDocumentiService.downloadNumeroCodiceSitoPerVincolataFile(numeroCodiceSitoPerVincolata).subscribe(res => {
            const base64Data = res.base64Data;
            const fileName = res.fileName;
            const fileType = res.fileType;
            this.downloadFile(base64Data, fileName, fileType);
            this.confirmationService.confirm({
                message: 'File uploaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        }, error => {
            this.confirmationService.confirm({
                message: 'Failed to download',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        })
    }
    downloadNumeroCodiceSitoPerRichiestaFile(numeroCodiceSitoPerRichiesta: any) {
        this.esportaDocumentiService.downloadNumeroCodiceSitoPerRichiestaFile(numeroCodiceSitoPerRichiesta).subscribe(res => {
            const base64Data = res.base64Data;
            const fileName = res.fileName;
            const fileType = res.fileType;
            this.downloadFile(base64Data, fileName, fileType);
            this.confirmationService.confirm({
                message: 'File uploaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        }, error => {
            this.confirmationService.confirm({
                message: 'Failed to download',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        })
    }
    downloadCodiceSitoPerRapportoDiMisuraFile(codiceSitoPerRapportoDiMisura: any) {
        this.esportaDocumentiService.downloadCodiceSitoPerRapportoDiMisuraFile(codiceSitoPerRapportoDiMisura).subscribe(res => {
            const base64Data = res.base64Data;
            const fileName = res.fileName;
            const fileType = res.fileType;
            this.downloadFile(base64Data, fileName, fileType);
            this.confirmationService.confirm({
                message: 'File uploaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        }, error => {
            this.confirmationService.confirm({
                message: 'Failed to download',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        })
    }

    downloadFatturazioneDaCompletareFile(fatturazioneDaCompletare: any) {
        this.esportaDocumentiService.downloadFatturazioneDaCompletareFile(fatturazioneDaCompletare).subscribe(res => {
            const base64Data = res.base64Data;
            const fileName = res.fileName;
            const fileType = res.fileType;
            this.downloadFile(base64Data, fileName, fileType);
            this.confirmationService.confirm({
                message: 'File uploaded',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        }, error => {
            this.confirmationService.confirm({
                message: 'Failed to download',
                header: 'Info',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.confirmationService.close();
                }
            });
            setTimeout(() => {
                this.confirmationService.close();
            }, 3000);
        })
    }
}
