import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {RilevazioniSitoService} from "./rilevazioni-sito.service";
import {RilevazioniSitoDto} from "./rilevazioni-sito-dto";
import {ModalService} from "../../../core/services/dialog.service";
import {ActivatedRoute} from "@angular/router";
@Component({
  selector: 'app-rilevazioni-sito',
  templateUrl: './rilevazioni-sito.component.html',
  styleUrls: ['./rilevazioni-sito.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,
})

export class RilevazioniSitoComponent implements OnInit{
  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  selectedIdProt: number;
  datas: RilevazioniSitoDto[];
  data: RilevazioniSitoDto;
  selectedDatas: RilevazioniSitoDto[];
  selectedData: RilevazioniSitoDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;
  numcodsitoOptions: any[];
  dialogStyles = {
    'width': '70vw',
  };

  dialogContentStyles = {
    'height': '80vh'
  };
  dataForm: FormGroup;

  constructor(private fb: FormBuilder, private rilevazioniSitoService: RilevazioniSitoService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private dialogService: ModalService,
              private route: ActivatedRoute) {
    this.rilevazioniSitoService.numcodsitoSelectboxValuesRilevazioniSito().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.numcodsitoOptions = res
            .filter(item => item.numcodsito|| item.gestore)  // Filter out entries with both fields null or empty
            .map(item => ({
              label: `${item.numcodsito || 'null'} / ${item.gestore || 'null'}`,  // Use 'N/A' for display if null
              value: item.numcodsito
            }));
      }
    });
  }

  ngOnInit() {
    this.rilevazioniSitoService.getRilevazioniSitoData().subscribe(data => {
      this.datas = data.sort((a, b) => b?.idmisurazione - a?.idmisurazione);
    });
    this.initializeForm();
  
    // Fetch query params
    this.route.queryParams.subscribe(params => {
      const formData: any = {
        numcodsito: params['numcodsito'],
        protocollo: params['protocollo'] || ''  // Se protocollo è null, impostalo su stringa vuota
      };
  
      // Controlla se `numcodsito` esiste e apri il form anche se `protocollo` è vuoto
      if (formData.numcodsito) {
        this.populateForm(formData);
        this.newDialog = true;
      }
    });
  }  

  initializeForm(): void {
    this.dataForm = this.fb.group({
      idmisurazione: [''],
      numcodsito: ['', Validators.required],
      protocollo: ['', Validators.required],
      sistema: [''],
      azimuth: [''],
      altcentrele: [''],
      antenna: [''],
      altezzaantenna: [''],
      guadagnoantenna: [''],
      tiltmecca: [''],
      titltelettr: [''],
      numerotrx: [''],
      potmaxsingtrx: [''],
      potmaxtotant: [''],
      attcei: [''],
      alpha24: [''],
      fattriduz: [''],
      pottotantfattrid: ['']
    });
  }

  // Populates the form with the data from state
  populateForm(data: any): void {
    this.dataForm.patchValue(data);
  }
  
  dataPatch(): void {
    this.dataForm.patchValue({
      idmisurazione: this.data?.idmisurazione || '',
      numcodsito: this.data?.numcodsito || '',
      protocollo: this.data?.protocollo || '',
      sistema: this.data?.sistema || '',
      azimuth: this.data?.azimuth || '',
      altcentrele: this.data?.altcentrele || '',
      antenna: this.data?.antenna || '',
      altezzaantenna: this.data?.altezzaantenna || '',
      guadagnoantenna: this.data?.guadagnoantenna || '',
      tiltmecca: this.data?.tiltmecca || '',
      titltelettr: this.data?.titltelettr || '',
      numerotrx: this.data?.numerotrx || '',
      potmaxsingtrx: this.data?.potmaxsingtrx || '',
      potmaxtotant: this.data?.potmaxtotant || '',
      attcei: this.data?.attcei || '',
      alpha24: this.data?.alpha24 || '',
      fattriduz: this.data?.fattriduz || '',
      pottotantfattrid: this.data?.pottotantfattrid || ''
    });
  }

  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: RilevazioniSitoDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.selectedIdProt = data.idmisurazione;
    this.isDataReadonly = false;
    this.dataPatch();
  }

  showData(data: RilevazioniSitoDto) {
    this.data = {...data};
    this.selectedData = this.data;
    this.dataShowDialog = true;
    this.isDataReadonly =  true;
    this.dataPatch();
  }
  hideDataDialog() {
    this.dataDialog = false;
    this.newDialog = false;
    this.submittedData = false;
  }
  hideShowDialog() {
    this.dataShowDialog = false;
    this.submittedData = false;
  }

  deleteData(data: RilevazioniSitoDto) {
    if(data.idmisurazione){
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.rilevazioniSitoService.deleteSelectedDataRilevazioniSito(data.idmisurazione).subscribe(
              (res) => {
                if (res.message === 'Dati eliminati con successo') {
                  setTimeout(() => {
                    this.showDeletionConfirmation();
                  }, 500);
                }
          },
              (error) => {
                console.log(error.message);
                this.dialogService.openError(error?.message)
              });
        }
      });
    }else{
      console.log('seleziona una riga da eliminare');
    }
  }
  onHideDialog() {
    // Custom logic when the dialog is closed
  }
  maximizeDialog() {
    this.isMaximized = !this.isMaximized;
    const dialogElement = document.querySelector('.p-dialog');
    if (this.isMaximized) {
      dialogElement.classList.add('p-dialog-maximized');
    } else {
      dialogElement.classList.remove('p-dialog-maximized');
    }
  }
  deleteSelectedDatas() {
    if (this.selectedDatas.length == 1) {
      const idmisurazione = this.selectedDatas[0].idmisurazione;
      if(idmisurazione){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.rilevazioniSitoService.deleteSelectedDataRilevazioniSito(idmisurazione).subscribe((res) => {
                  if (res.message === 'Dati eliminati con successo') {
                    setTimeout(() => {
                      this.showDeletionConfirmation();
                    }, 500);
                  }
                },
                (error) => {
                  console.log(error.message);
                  this.dialogService.openError(error?.message)
                })
          }
        });
      }
    } else if(this.selectedDatas.length > 1){
      const idmisuraziones = this.selectedDatas.map(data => data.idmisurazione);
      if(idmisuraziones.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.rilevazioniSitoService.deletemultipleSelectedDatasRilevazioniSito(idmisuraziones).subscribe((res) => {
              if(res.message == 'Dati eliminati con successo'){
                setTimeout(() => {
                  this.showDeletionsConfirmation();
                }, 500);
              }
            });
          }
        });
      }
    }else{
      console.log('Seleziona una riga da eliminare');
    }
  }
  showDeletionConfirmation() {
    this.confirmationService.confirm({
      message: 'Rilevazioni Sito eliminato',
      header: 'Info',
      acceptLabel: 'Ok',
      rejectVisible: false,
      accept: () => {
        window.location.reload();
      },
    });
  }
  showDeletionsConfirmation() {
    this.confirmationService.confirm({
      message: 'Rilevazioni Sito eliminati',
      header: 'Info',
      acceptLabel: 'Ok',
      rejectVisible: false,
      accept: () => {
        window.location.reload();
      },
    });
  }
  saveData(){
    const dtoOut = new RilevazioniSitoDto();
    dtoOut.numcodsito = this.dataForm.get('numcodsito').value;
    dtoOut.protocollo = this.dataForm.get('protocollo').value;
    dtoOut.sistema = this.dataForm.get('sistema').value;
    dtoOut.azimuth = this.dataForm.get('azimuth').value;
    dtoOut.altcentrele = this.dataForm.get('altcentrele').value;
    dtoOut.antenna = this.dataForm.get('antenna').value;
    dtoOut.altezzaantenna = this.dataForm.get('altezzaantenna').value;
    dtoOut.guadagnoantenna = this.dataForm.get('guadagnoantenna').value;
    dtoOut.tiltmecca = this.dataForm.get('tiltmecca').value;
    dtoOut.titltelettr = this.dataForm.get('titltelettr').value;
    dtoOut.numerotrx = this.dataForm.get('numerotrx').value;
    dtoOut.potmaxsingtrx = this.dataForm.get('potmaxsingtrx').value;
    dtoOut.potmaxtotant = this.dataForm.get('potmaxtotant').value;
    dtoOut.attcei = this.dataForm.get('attcei').value;
    dtoOut.alpha24 = this.dataForm.get('alpha24').value;
    dtoOut.fattriduz = this.dataForm.get('fattriduz').value;
    dtoOut.pottotantfattrid = this.dataForm.get('pottotantfattrid').value;
    if( dtoOut.numcodsito &&
        dtoOut.protocollo){

      if (this.newDialog == true) {
        this.rilevazioniSitoService.postSaveNewRilevazioniSitoData(dtoOut).subscribe((res) => {
          if (res) {
            this.newDialog = false;
            this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Codice Sito gestori inserito correttamente', life: 3000});
            this.confirmationService.close();
            this.rilevazioniSitoService.getRilevazioniSitoData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.idmisurazione - a?.idmisurazione);
            });
          }
        }, error => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: error.error.message, life: 3000});
        });
      } else if (this.dataDialog == true) {
        this.rilevazioniSitoService.putUpdatedOneDataRilevazioniSito(this.selectedIdProt, dtoOut).subscribe((res) => {
          if (res) {
            this.dataDialog = false;
            this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Sito modificato correttamentei', life: 3000});
            this.confirmationService.close();
            this.rilevazioniSitoService.getRilevazioniSitoData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.idmisurazione - a?.idmisurazione);
            });
          }
        }, (error) => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: error.error.message, life: 3000});
        });
      }
    }else{
      console.log('pls enter required values')
    }
  }

  exportExcelAll() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.datas);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'table.xlsx');
  }
  selectedExportExcel() {
    // Filter selected rows
    const selectedData = this.datas.filter(data => this.selectedDatas.includes(data));

    // Convert filtered data to Excel format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save as Excel file
    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneData() {
    const selectedData = this.datas.filter(data => this.selectedData.idmisurazione  == data.idmisurazione );
    // Convert filtered data to Excel format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save as Excel file
    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  }

  duplicateData(data: RilevazioniSitoDto) {
    // Popola il form con i dati duplicati, lasciando vuoti i campi non desiderati
    this.dataForm.patchValue({
        numcodsito: data.numcodsito,  // Pre-popolare il campo numcodsito
        protocollo: data.protocollo,  // Pre-popolare il campo protocollo
        sistema: '',
        azimuth: '',
        altcentrele: '',
        antenna: '',
        altezzaantenna: '',
        guadagnoantenna: '',
        tiltmecca: '',
        titltelettr: '',
        numerotrx: '',
        potmaxsingtrx: '',
        potmaxtotant: '',
        attcei: '',
        alpha24: '',
        fattriduz: '',
        pottotantfattrid: ''
    });

    // dialog per inserire i dati duplicati
    this.newDialog = true;
    this.isDataReadonly = false;  // form editabile
  }
}
