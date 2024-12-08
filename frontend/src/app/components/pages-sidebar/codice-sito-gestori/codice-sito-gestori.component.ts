import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {CodiceSitoGestoriService} from "./codice-sito-gestori.service";
import {CodiceSitoGestoriDto} from "./codice-sito-gestori-dto";
import {ModalService} from "../../../core/services/dialog.service";
import {ProtocolloCemDto} from "../protocollo-cem/protocollo-cem-dto";
import {ProtocolloCemService} from "../protocollo-cem/protocollo-cem.service";
import {Observable, of, switchMap, tap} from "rxjs";
import { Router } from '@angular/router';
@Component({
  selector: 'app-codice-sito-gestori',
  templateUrl: './codice-sito-gestori.component.html',
  styleUrls: ['./codice-sito-gestori.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class CodiceSitoGestoriComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  numcodsito: number;
  datas: CodiceSitoGestoriDto[];
  data: CodiceSitoGestoriDto;
  selectedDatas: CodiceSitoGestoriDto[];
  selectedData: CodiceSitoGestoriDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  selectedProtocolPopupData: ProtocolloCemDto;
  dataProtocolPopupDialog: boolean;
  isMaximized: boolean = false;

  gestoreOptions: any[];
  statoimpiantoOptions: any[];
  statoproceduraOptions: any[];
  regioneOptions: any[];
  provinciaOptions: any[] = [];
  schedaRadioElettricaTableValue: any[] = [];
  tableHeaders: string[] = [];
  comuneOptions: any[] = [];
  protcollOptions: any[];
  selectedRow: any;
  schedaRadioElettricaTable: boolean = true;
  hideSchedaRadioElettricaTableButton: boolean = false;
  dataForm: FormGroup;
  dialogStyles = {
    'width': '70vw',
  };

  dialogContentStyles = {
    'height': '80vh'
  };

  selectedRegionCode: any;
  selectedProvinciaCode: any;
  selectedComuneCode: any;
  selectedRegioneOptions: any[];
  selectedProvinciaOptions: any[];
  selectedComuneOptions: any[];

  constructor(private fb: FormBuilder, private codiceSitoGestoriService: CodiceSitoGestoriService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private dialogService: ModalService,
              private protocolloCemService: ProtocolloCemService,
              private cdr: ChangeDetectorRef, private router: Router) {
  }

  ngOnInit() {

    this.codiceSitoGestoriService.getCodiceSitoGestoriData().subscribe(data => {
      this.datas = data;
    });
    this.codiceSitoGestoriService.gestoreSelectboxValuesCodiceSitoGestori().subscribe(res => {
      this.gestoreOptions = res;
    })
    this.codiceSitoGestoriService.statoimpiantoSelectboxValuesCodiceSitoGestori().subscribe(res => {
      this.statoimpiantoOptions = res;
    })
    this.codiceSitoGestoriService.statoproceduraSelectboxValuesCodiceSitoGestori().subscribe(res => {
      this.statoproceduraOptions = res;
    })
    this.codiceSitoGestoriService.regioneSelectboxValuesCodiceSitoGestori().subscribe(res => {
      this.regioneOptions = res;
    })
    this.codiceSitoGestoriService.protcollSelectboxValuesCodiceSitoGestori().subscribe(res => {
      if (res && Array.isArray(res)) {
        const data = res.filter(item => item.protocollo !== '').map(item => item.protocollo);
        this.protcollOptions = data
            .filter(item => item !== null)
            .map(item => ({ label: item, value: item }));
      }
    })

    this.initializeForm();

    this.dataForm.get('regione')?.valueChanges.subscribe(value => {
      if (value) {
        this.dataForm.get('provincia')?.enable();
      } else {
        this.dataForm.get('provincia')?.disable();
        this.dataForm.get('comune')?.disable();
      }
      this.provinciaOptions = [];
      this.comuneOptions = [];
    });

    this.dataForm.get('provincia')?.valueChanges.subscribe(value => {
      if (value) {
        this.dataForm.get('comune')?.enable();
      } else {
        this.dataForm.get('comune')?.disable();
      }
      this.comuneOptions = [];
    });

  }

  customSort(event: any) {
    event.data.sort((data1: any, data2: any) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];

      if (event.field === 'numlocosscem') {
        value1 = +value1;  // Convert to number
        value2 = +value2;
      }

      let result = 0;

      if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2); // String comparison
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0; // Numeric comparison
      }

      return (event.order * result);
    });
  }


  aggiungiScheda(data: any) {
    const duplicatedData = {
      numcodsito: data.numcodsito,
      protocollo: data.protcoll
    };
    // Navigate with query parameters
    this.router.navigate(['/rilevazionisito'], {
      queryParams: {
        numcodsito: duplicatedData.numcodsito,
        protocollo: duplicatedData.protocollo
      }
    });
  }
  
  onRegioneChange(event: any) {
    const selectedRegioneCode = event.value;
    this.dataForm.get('provincia')?.setValue(null);
    this.dataForm.get('comune')?.setValue(null);
    this.provinciaOptions = [];
    this.comuneOptions = [];

    if (selectedRegioneCode) {
      this.codiceSitoGestoriService.provinciaSelectboxValuesCodiceSitoGestori(selectedRegioneCode).subscribe(res => {
        this.provinciaOptions = res;
      });
    }
  }

  showSchedaRadioElettricaTable(data: any){
    this.selectedRow = data;
    this.isDataReadonly =  true;
    if (data?.numcodsito) {
      this.fetchSchedaRadioElettrica(data, data.numcodsito);
    }
  }
  hideSchedaRadioElettricaTable() {
    this.hideSchedaRadioElettricaTableButton = false;
    this.schedaRadioElettricaTable = true;
    this.isDataReadonly =  true;
  }

  fetchSchedaRadioElettrica(data, numcodsito: string): void {
    this.codiceSitoGestoriService.radioSchedaElettricaValuesCodiceSitoGestori(numcodsito).subscribe(
        res => {
            console.log('API Response:', res);
            if (res && Array.isArray(res)) {
                // Escludi la chiave "idmisurazione" dalle intestazioni e dai dati
              if(res.length > 0){
                this.hideSchedaRadioElettricaTableButton = true;
                this.schedaRadioElettricaTable = true;
                this.selectedData = data;
                this.tableHeaders = res.length > 0 ? Object.keys(res[0]).filter(key => key !== 'idmisurazione') : [];

                // Rimuovi la proprietà "idmisurazione" dai dati
                this.schedaRadioElettricaTableValue = res.map(item => {
                  const { idmisurazione, ...rest } = item; // Escludi "idmisurazione"
                  return rest;
                });
              }else{
                this.schedaRadioElettricaTable = true;
              }
            } else {
                console.error('Unexpected response format:', res);
                this.schedaRadioElettricaTableValue = [];
                this.tableHeaders = [];
            }
            this.cdr.detectChanges(); // Trigger change detection if necessary
        },
        err => {
            console.error('API Error:', err);
            this.schedaRadioElettricaTableValue = [];
            this.tableHeaders = [];
        }
    );
  }

  tableColumnLabels: { [key: string]: string } = {
    numcodsito: 'Numero Cod Sito',
    protocollo: 'Protocollo',
    sistema: 'Sistema',
    azimuth: 'Azimuth',
    altcentrele: 'Altezza Centro Elettrico',
    antenna: 'Antenna',
    altezzaantenna: 'Altezza Antenna',
    guadagnoantenna: 'Guadagno Antenna',
    tiltmecca: 'Tilt Meccanico',
    titltelettr: 'Tilt Elettrico',
    numerotrx: 'Numero di Trx',
    potmaxsingtrx: 'Potenza Massima per Singolo Trx',
    potmaxtotant: 'Potenza Massima Totale in Antenna',
    attcei: 'Att. CEI',
    alpha24: 'ALPHA24',
    fattriduz: 'Fattore di Riduzione',
    pottotantfattrid: 'Potenza Totale con Riduzione'
  };

  onProvinciaChange(event: any) {
    const selectedProvinciaCode = event.value;
    this.dataForm.get('comune')?.setValue(null);
    this.comuneOptions = [];

    if (selectedProvinciaCode) {
      this.codiceSitoGestoriService.comuneSelectboxValuesCodiceSitoGestori(selectedProvinciaCode).subscribe(res => {
        this.comuneOptions = res;
        if(this.comuneOptions && this.comuneOptions.length > 0){
          this.comuneOptions = this.comuneOptions.map(option => ({
            ...option,
            label: `${option.denominazione} / ${option.codice}`
          }));
        }
      });
    }
  }

  parseProtcoll(protcoll: string): string[] {
    if (!protcoll) {
      return [];
    }

    // Remove backslashes from the string
    protcoll = protcoll.replace(/\\/g, '');

    // Parse the JSON string into an array
    return JSON.parse(protcoll);
  }
  parseDataFields(value: any): any {
    return value;
  }
  getProtocolloForClickedPopup(protocol: any){
    this.protocolloCemService.getProtocolloForClickedPopup(protocol).subscribe((data: any) => {
      console.log(data)
        this.showProtocolPopupData(data[0]);
    }, error => {
      console.error('Error fetching data:', error);
      // Handle error as needed
    });
  }
  onHideDialog() {
    // Custom logic when the dialog is closed
  }
  hideProtocolPopupDataDialog() {
    this.dataProtocolPopupDialog = false;
  }
  showProtocolPopupData(data: ProtocolloCemDto){
    this.selectedProtocolPopupData = data;
    this.dataProtocolPopupDialog = true;
    this.isDataReadonly =  true;
  }
  initializeForm(): void {
    this.dataForm = this.fb.group({
      numcodsito: ['', Validators.required],
      numcodsitoold: ['', Validators.required],
      nomesito: ['', Validators.required],
      gestore: ['', Validators.required],
      tipoimpianto: [''],
      statoimpianto: [''],
      statoprocedura: [''],
      regione: [null],
      provincia: [{ value: null, disabled: true }],
      comune: [{ value: null, disabled: true }],
      indirizzo: [''],
      numlocosscem: [''],
      locosscem: [''],
      coordinatelong: [''],
      coordinatelat: [''],
      protocollocheck: [''],
      protcoll: [''],
      linkcondivisia: [''],
      dataprot: [''],
    });
  }

  dataPatch(): void{
    this.dataForm.patchValue({
      numcodsito: this.data?.numcodsito || '',
      numcodsitoold: this.data?.numcodsitoold || '',
      nomesito: this.data?.nomesito || '',
      gestore: this.data?.gestore || '',
      tipoimpianto: this.data?.tipoimpianto || '',
      statoimpianto: this.data?.statoimpianto || '',
      statoprocedura: this.data?.statoprocedura || '',
      regione: this.data?.regione || '',
      provincia: this.data?.provincia || '',
      comune: this.data?.comune || '',
      indirizzo: this.data?.indirizzo || '',
      numlocosscem: this.data?.numlocosscem || '',
      locosscem: this.data?.locosscem || '',
      coordinatelong: this.data?.coordinatelong || '',
      coordinatelat: this.data?.coordinatelat || '',
      protocollocheck: this.data?.protocollocheck || '',
      protcoll: this.data?.protcoll || '',
      linkcondivisia: this.data?.linkcondivisia || '',
      dataprot: this.data?.dataprot || '',
    });
  }

  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: CodiceSitoGestoriDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.numcodsito = data.numcodsito;
    this.isDataReadonly = false;
    this.dataPatch();
    let regioneValue = this.data.regione;
    let provincaValue = this.data.provincia;
    let comuneValue = this.data.comune;
    let regioneCodeValue: any;
    let provinciaCodeValue: any;
    let comuneCodeValue: any;
    if(regioneValue) {
      this.codiceSitoGestoriService.regioneSelectboxValuesCodiceSitoGestori().subscribe(res => {
        const regioneValues = res;
        regioneCodeValue = regioneValues.find(x => x.denominazione == regioneValue)
        this.dataForm.controls['regione'].setValue(regioneCodeValue.codice);
        if (regioneCodeValue && provincaValue) {
          this.codiceSitoGestoriService.provinciaSelectboxValuesCodiceSitoGestori(regioneCodeValue.codice).subscribe(res => {
            this.provinciaOptions = res;
            provinciaCodeValue = this.provinciaOptions.find(x => x.denominazione == provincaValue)
            console.log(provinciaCodeValue)
            this.dataForm.controls['provincia'].setValue(provinciaCodeValue.codice);
            if (regioneCodeValue && provinciaCodeValue && comuneValue) {
              this.codiceSitoGestoriService.comuneSelectboxValuesCodiceSitoGestori(provinciaCodeValue.codice).subscribe(res => {
                this.comuneOptions = res;
                if (this.comuneOptions && this.comuneOptions.length > 0) {
                  this.comuneOptions = this.comuneOptions.map(option => ({
                    ...option,
                    label: `${option.denominazione} / ${option.codice}`
                  }));
                }
                comuneCodeValue = this.comuneOptions.find(x => x.denominazione == comuneValue)
                console.log(comuneCodeValue)
                this.dataForm.controls['comune'].setValue(comuneCodeValue.codice);
              })
            }
          })
        }
      })
    }
  }


  showData(data: CodiceSitoGestoriDto) {
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
  maximizeDialog() {
    this.isMaximized = !this.isMaximized;
    const dialogElement = document.querySelector('.p-dialog');
    if (this.isMaximized) {
      dialogElement.classList.add('p-dialog-maximized');
    } else {
      dialogElement.classList.remove('p-dialog-maximized');
    }
  }

  hideShowDialog() {
    this.dataShowDialog = false;
    this.submittedData = false;
  }
  navigateTo() {
    const url = 'https://dropfacile.it/arpab/qgis2web_2024_02_10-19_08_00_856364/index.html#17/40.643693/15.787018';
    window.open(url, '_blank');
  }
  deleteData(data: CodiceSitoGestoriDto) {
    if(data.numcodsito){
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.codiceSitoGestoriService.deleteSelectedDataCodiceSitoGestori(data.numcodsito).subscribe(
              (res) => {
                if (res.message === 'Dati eliminati con successo') {
                  this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
                  this.confirmationService.close();
                  window.location.reload();
                }
              },
              (error) => {
                console.log(error.message);
                this.dialogService.openError(error?.message)
              }
          );
        }
      });
    }else{
      console.log('pls select a row to be deleted!')
    }
  }

  deleteSelectedDatas() {
    if (this.selectedDatas.length == 1) {
      const numcodsito = this.selectedDatas[0].numcodsito;
      if(numcodsito){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.codiceSitoGestoriService.deleteSelectedDataCodiceSitoGestori(numcodsito).subscribe((res) => {
                  if (res.message === 'Dati eliminati con successo') {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
                    this.confirmationService.close();
                    window.location.reload();
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
      const numcodsitos = this.selectedDatas.map(data => data.numcodsito);
      if(numcodsitos.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.codiceSitoGestoriService.deletemultipleSelectedDatasCodiceSitoGestori(numcodsitos).subscribe((res) => {
                  if(res.message == 'Dati eliminati con successo'){
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
                    this.confirmationService.close();
                    window.location.reload();
                  }
                },
                (error) => {
                  console.log(error.message);
                  this.dialogService.openError(error?.message)
                });
          }
        });
      }
    }else{
      console.log('Seleziona una riga da eliminare!');
    }
  }
  showDeletionConfirmation() {
    this.confirmationService.confirm({
      message: 'Codicesito Gestori eliminato',
      header: 'Info',
      acceptLabel: 'Ok',
      rejectVisible: false,
      accept: () => {
        window.location.reload();
      },
    });
  }

  loadRegioneOptions() {
    return this.codiceSitoGestoriService.regioneSelectboxValuesCodiceSitoGestori().pipe(
        tap(res => {
          this.selectedRegioneOptions = res;
          this.selectedRegionCode = this.selectedRegioneOptions.find(x => x.codice == this.dataForm.get('regione').value);
        })
    );
  }

  loadProvinciaOptions() {
    return this.codiceSitoGestoriService.provinciaSelectboxValuesCodiceSitoGestori(this.selectedRegionCode?.codice).pipe(
        tap(res => {
          this.selectedProvinciaOptions = res;
          this.selectedProvinciaCode = this.selectedProvinciaOptions.find(x => x.codice == this.dataForm.get('provincia').value);
        })
    );
  }

  loadComuneOptions() {
    return this.codiceSitoGestoriService.comuneSelectboxValuesCodiceSitoGestori(this.selectedProvinciaCode?.codice).pipe(
        tap(res => {
          this.selectedComuneOptions = res;
          this.selectedComuneCode = this.selectedComuneOptions.find(x => x.codice == this.dataForm.get('comune').value);
        })
    );
  }
  escapeString(value: string): string {
    return value.replace(/'/g, "''");
  }
  saveData(){
    const dtoOut = new CodiceSitoGestoriDto();
    dtoOut.numcodsito = this.dataForm.get('numcodsito').value;
    dtoOut.numcodsitoold = this.dataForm.get('numcodsitoold').value;
    dtoOut.nomesito = this.dataForm.get('nomesito').value;
    dtoOut.gestore = this.dataForm.get('gestore').value;
    dtoOut.tipoimpianto = this.dataForm.get('tipoimpianto').value;
    dtoOut.statoimpianto = this.dataForm.get('statoimpianto').value;
    dtoOut.statoprocedura = this.dataForm.get('statoprocedura').value;
    // dtoOut.regione = this.dataForm.get('regione')?.value;
    // dtoOut.provincia = this.dataForm.get('provincia')?.value;
    // dtoOut.comune = this.dataForm.get('comune')?.value;
    dtoOut.indirizzo = this.dataForm.get('indirizzo').value;
    dtoOut.numlocosscem = this.dataForm.get('numlocosscem').value;
    dtoOut.locosscem = this.dataForm.get('locosscem').value;
    dtoOut.coordinatelong = this.dataForm.get('coordinatelong').value;
    dtoOut.coordinatelat = this.dataForm.get('coordinatelat').value;
    dtoOut.protocollocheck = this.dataForm.get('protocollocheck').value;
    dtoOut.protcoll = this.dataForm.get('protcoll').value;
    dtoOut.linkcondivisia = this.dataForm.get('linkcondivisia').value;

    let loadOperations : Observable<any> = of(true);

    if (this.dataForm.get('regione').value) {
      loadOperations = loadOperations.pipe(
          switchMap(() => this.loadRegioneOptions()),
          tap(() => {
            dtoOut.regione = this.selectedRegionCode ? this.escapeString(this.selectedRegionCode.denominazione) : '';
          })
      );
    } else {
      dtoOut.regione = '';
    }

    if (this.dataForm.get('provincia').value) {
      loadOperations = loadOperations.pipe(
          switchMap(() => this.loadProvinciaOptions()),
          tap(() => {
            dtoOut.provincia = this.selectedProvinciaCode ? this.escapeString(this.selectedProvinciaCode.denominazione) : '';
          })
      );
    } else {
      dtoOut.provincia = '';
    }

    if (this.dataForm.get('comune').value) {
      loadOperations = loadOperations.pipe(
          switchMap(() => this.loadComuneOptions()),
          tap(() => {
            dtoOut.comune = this.selectedComuneCode ? this.escapeString(this.selectedComuneCode.denominazione) : '';
          })
      );
    } else {
      dtoOut.comune = '';
    }

    loadOperations.subscribe(() => {
      if (dtoOut.numcodsito && dtoOut.numcodsitoold && dtoOut.nomesito && dtoOut.gestore) {
        if (this.newDialog == true) {
          this.codiceSitoGestoriService.postSaveNewCodiceSitoGestoriData(dtoOut).subscribe((res) => {
            if (res) {
              this.newDialog = false;
              this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Codice Sito gestori inserito correttamente', life: 3000});
              this.confirmationService.close();
              this.codiceSitoGestoriService.getCodiceSitoGestoriData().subscribe(data => {
                this.datas = data;
              });
            }
          }, error => {
            this.messageService.add({severity: 'error', summary: 'Error', detail: error.error.message, life: 3000});
          });
        } else if (this.dataDialog == true) {
          this.codiceSitoGestoriService.putUpdatedOneDataCodiceSitoGestori(this.numcodsito, dtoOut).subscribe((res) => {
            if (res) {
              this.dataDialog = false;
              this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Sito modificato correttamentei', life: 3000});
              this.confirmationService.close();
              this.codiceSitoGestoriService.getCodiceSitoGestoriData().subscribe(data => {
                this.datas = data;
              });
            }
          }, (error) => {
            this.messageService.add({severity: 'error', summary: 'Error', detail: error.error.message, life: 3000});
          });
        }
      }
    })
  }

  // exportPdf() {
  //   import('jspdf').then((jspdf) => {
  //     import('jspdf-autotable').then((jspdfAutotable) => {
  //       const doc = new jspdf.default('p', 'px', 'a4');
  //       (doc as any).autoTable({ html: '#dt' }); // Declare autoTable as any
  //       doc.save('table.pdf');
  //     });
  //   });
  // }

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
  selectedExportExcelForOneDataProtocolPopup(selectedData: ProtocolloCemDto): void {
    const data: ProtocolloCemDto[] = [selectedData];
    console.log(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneData() {
    const selectedData = this.datas.filter(data => this.selectedData.numcodsito  == data.numcodsito );
    // Convert filtered data to Excel format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save as Excel file
    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  // exportWord() {
  //   const doc = new docx.Document();
  //   const table = doc.createTable(this.datas.length + 1, 4); // Adjust the number of rows and columns as per your data
  //   // Insert headers
  //   table.getCell(0, 0).addContent(new docx.Paragraph('ID Misura'));
  //   table.getCell(0, 1).addContent(new docx.Paragraph('Technologia'));
  //   table.getCell(0, 2).addContent(new docx.Paragraph('Potenza'));
  //   table.getCell(0, 3).addContent(new docx.Paragraph('Numero Cod Sito'));
  //
  //   // Insert data
  //   this.datas.forEach((data, index) => {
  //     table.getCell(index + 1, 0).addContent(new docx.Paragraph(data.idMisura));
  //     table.getCell(index + 1, 1).addContent(new docx.Paragraph(data.technologia));
  //     table.getCell(index + 1, 2).addContent(new docx.Paragraph(data.potenza));
  //     table.getCell(index + 1, 3).addContent(new docx.Paragraph(data.numeroCodSito));
  //   });
  //
  //   const buffer = docx.Packer.toBuffer(doc);
  //   fs.writeFileSync('table.docx', buffer);
  // }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  }
}
