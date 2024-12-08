import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {ElencoRumoreService} from "./elenco-rumore.service";
import {ElencoRumoreDto} from "./elenco-rumore-dto";
import {ModalService} from "../../../core/services/dialog.service";
import {Observable, of, switchMap, tap} from "rxjs";

@Component({
  selector: 'app-elenco-rumore',
  templateUrl: './elenco-rumore.component.html',
  styleUrls: ['./elenco-rumore.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class ElencoRumoreComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  numcodcar: number;
  datas: ElencoRumoreDto[];
  data: ElencoRumoreDto;
  selectedDatas: ElencoRumoreDto[];
  selectedData: ElencoRumoreDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;
  selectedRow: any;
  schedaRadioObbTableValue: any[] = [];
  tableHeaders: string[] = [];
  schedaRadioObbTable: boolean = false;
  gestoreOptions: any[];

  selectedProvinciaCode: any;
  selectedComuneCode: any;
  selectedProvinciaOptions: any[];
  selectedComuneOptions: any[];

  regioneOptions: any[];
  provinciaOptions =  [
      {
        "codice": "MT",
        "denominazione": "Matera"
      },
      {
        "codice": "PZ",
        "denominazione": "Potenza"
      }
      ]
  comuneOptions: any[] = [];

  dataForm: FormGroup;
  dialogStyles = {
    'width': '70vw',
  };

  dialogContentStyles = {
    'height': '80vh'
  };
  tipologiaosOptions: { label: string, value: string }[] = [
    { label: 'Industriali', value: 'Industriali' },
    { label: 'Artigianali', value: 'Artigianali' },
    { label: 'Agricole', value: 'Agricole' },
    { label: 'Altre Attività Produttive', value: 'Altre Attività Produttive' },
    { label: 'Locali intrattenimento danzante', value: 'Locali intrattenimento danzante' },
    { label: 'Pubblici esercizi e circoli privati', value: 'Pubblici esercizi e circoli privati' },
    { label: 'Commerciali, professionali e di servizio', value: 'Commerciali, professionali e di servizio' },
    { label: 'Temporanee (cantieri, manifestazioni)', value: 'Temporanee (cantieri, manifestazioni)' },
    { label: 'Infrastrutture Trasporto Stradali (Autostrade, Strade Extraurbane, Strade Urbane)', value: 'Infrastrutture Trasporto Stradali (Autostrade, Strade Extraurbane, Strade Urbane)' },
    { label: 'Infrastrutture Trasporto Ferroviarie (Stazione, Linea Ferroviaria, Metropolitane, Scali Merci e altro)', value: 'Infrastrutture Trasporto Ferroviarie (Stazione, Linea Ferroviaria, Metropolitane, Scali Merci e altro)' },
    { label: 'Infrastrutture Trasporto Marittime', value: 'Infrastrutture Trasporto Marittime' },
    { label: 'Infrastrutture Trasporto Aeroportuali', value: 'Infrastrutture Trasporto Aeroportuali' },
    { label: 'Infrastrutture Trasporto Portuali (Porti, Scali Merci, Terminal e Altro)', value: 'Infrastrutture Trasporto Portuali (Porti, Scali Merci, Terminal e Altro)' },
  ];

  constructor(private fb: FormBuilder, private elencoRumoreService: ElencoRumoreService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private dialogService: ModalService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {

    this.elencoRumoreService.getElencoGestoriRumcemData().subscribe(data => {
      this.datas = data.sort((a, b) => b?.idaut - a?.idaut);
    });

    this.elencoRumoreService.regioneSelectboxValues().subscribe(res => {
      this.regioneOptions = res;
    })

    this.initializeForm();


    this.dataForm.get('provincia')?.valueChanges.subscribe(value => {
      if (value) {
        this.dataForm.get('comune')?.enable();
      } else {
        this.dataForm.get('comune')?.disable();
      }
      this.comuneOptions = [];
    });

  }


  onProvinciaChange(event: any) {
    const selectedProvinciaCode = event.value;
    this.dataForm.get('comune')?.setValue(null);
    this.comuneOptions = [];

    if (selectedProvinciaCode) {
      this.elencoRumoreService.comuneSelectboxValuesCodiceSitoGestori(selectedProvinciaCode).subscribe(res => {
        if (res && Array.isArray(res)) {
          this.comuneOptions = res
              .filter(item => item.denominazione && item.codice)
              .map(item => ({ label: `${item.denominazione} / ${item.codice}`, value: item.codice }));
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

  onHideDialog() {
    // Custom logic when the dialog is closed
  }

  initializeForm(): void {
    this.dataForm = this.fb.group({
      numcodcar: [''],
      numcodcarold: [''],
      denominazione: [''],
      gestore: [''],
      attivita: [''],
      idaut: [''],
      dataril: [''],
      numautatt: [''],
      tipaut: [''],
      dataproc: [''],
      protcoll: [''],
      provincia: [{ value: null}],
      comune: [{ value: null}],
      coordinatelat: [''],
      coordinatelong: [''],
      indirizzo: [''],
      nomesito: [''],
      autesp: [''],
      sorgente: [''],
      tipologiaoss: [''],
      schedaobb: [''],
      note: [''],
      linkcondivisia: [''],
    });
  }

  dataPatch(): void{
    this.dataForm.patchValue({
      numcodcar: this.data?.numcodcar || '',
      numcodcarold: this.data?.numcodcarold || '',
      denominazione: this.data?.denominazione || '',
      gestore: this.data?.gestore || '',
      attivita: this.data?.attivita || '',
      idaut: this.data?.idaut || '',
      dataril: this.data?.dataril || '',
      numautatt: this.data?.numautatt || '',
      tipaut: this.data?.tipaut || '',
      dataproc: this.data?.dataproc || '',
      protcoll: this.data?.protcoll || '',
      provincia: this.data?.provincia || '',
      comune: this.data?.comune || '',
      coordinatelat: this.data?.coordinatelat || '',
      coordinatelong: this.data?.coordinatelong || '',
      indirizzo: this.data?.indirizzo || '',
      nomesito: this.data?.nomesito || '',
      autesp: this.data?.autesp || '',
      sorgente: this.data?.sorgente || '',
      tipologiaoss: this.data?.tipologiaoss || '',
      schedaobb: this.data?.schedaobb || '',
      note: this.data?.note || '',
      linkcondivisia: this.data?.linkcondivisia || '',
    });
  }


  showSchedaRadioElettricaTable(data: any){
    this.selectedRow = data;
    this.schedaRadioObbTable = true;
    this.isDataReadonly =  true;
    if (data?.numcodcar) {
      this.fetchSchedaRadioElettrica(data.numcodcar);
    }
  }
  hideSchedaRadioElettricaTable(data: any) {
    this.schedaRadioObbTable = false;
    this.isDataReadonly =  true;
  }

  fetchSchedaRadioElettrica(numcodcar: string): void {
    this.elencoRumoreService.radioSchedaObbValuesCodiceSitoGestori(numcodcar).subscribe(
        res => {
          console.log('API Response:', res);
          if (res && Array.isArray(res)) {
            this.schedaRadioObbTableValue = res;
            this.tableHeaders = res.length > 0 ? Object.keys(res[0]) : [];
          } else {
            console.error('Unexpected response format:', res);
            this.schedaRadioObbTableValue = [];
            this.tableHeaders = [];
          }
          this.cdr.detectChanges(); // Trigger change detection if necessary
        },
        err => {
          console.error('API Error:', err);
          this.schedaRadioObbTableValue = [];
          this.tableHeaders = [];
        }
    );
  }
  openNewData() {
    this.data = {};
    this.selectedProvinciaCode = null;
    this.selectedComuneCode = null;
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: ElencoRumoreDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.numcodcar = data.numcodcar;
    this.isDataReadonly = false;
    this.dataPatch();


    const datarilValue = this.data.dataril; // Assuming 'dataril' comes as a string
    if (datarilValue) {
      const formattedDateril = new Date(datarilValue); // Convert to Date object
      this.dataForm.controls['dataril'].setValue(formattedDateril);
    } else {
      this.dataForm.controls['dataril'].setValue(null);
    }


    const dataprocValue = this.data.dataproc;
    if (dataprocValue) {
      const formattedDateproc = new Date(dataprocValue); // Convert to Date object
      this.dataForm.controls['dataproc'].setValue(formattedDateproc);
    } else {
      this.dataForm.controls['dataproc'].setValue(null);
    }


    let provincaValue = this.data.provincia;
    let comuneValue = this.data.comune;
    let regioneCodeValue: any;
    let provinciaCodeValue: any;
    let comuneCodeValue: any;

        if(provincaValue){
          this.provinciaOptions =  [
            {
              "codice": "MT",
              "denominazione": "Matera"
            },
            {
              "codice": "PZ",
              "denominazione": "Potenza"
            }
          ]
            provinciaCodeValue = this.provinciaOptions.find(x => x.denominazione == provincaValue)
            console.log(provinciaCodeValue)
            this.dataForm.controls['provincia'].setValue(provinciaCodeValue.codice);
            if(provinciaCodeValue && comuneValue){
              this.elencoRumoreService.comuneSelectboxValuesCodiceSitoGestori(provinciaCodeValue.codice).subscribe(res => {
                if (res && Array.isArray(res)) {
                  this.comuneOptions = res
                      .filter(item => item.denominazione && item.codice)
                      .map(item => ({ label: `${item.denominazione} / ${item.codice}`, value: item.codice }));
                }
                // comuneValue = ["077001","077002","077003"];
                comuneCodeValue = this.comuneOptions.filter(item => comuneValue.includes(item.label))
                console.log(comuneCodeValue)
                const selectedComuneCodeData = comuneCodeValue.map(item => ({
                  label: item.label,
                  value: item.value
                }));
                const selectedCodesArray = selectedComuneCodeData.map(x => x.value);
                this.dataForm.controls['comune'].setValue(selectedCodesArray);
              })
            }
        }

  }


  showData(data: ElencoRumoreDto) {
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
  deleteData(data: ElencoRumoreDto) {
    if(data.numcodcar){
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.elencoRumoreService.deleteSelectedDataElencoGestoriRumcem(data.numcodcar).subscribe(
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
      const numcodcar = this.selectedDatas[0].numcodcar;
      if(numcodcar){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.elencoRumoreService.deleteSelectedDataElencoGestoriRumcem(numcodcar).subscribe((res) => {
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
      const numcodcars = this.selectedDatas.map(data => data.numcodcar);
      if(numcodcars.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.elencoRumoreService.deletemultipleSelectedDatasElencoGestoriRumcem(numcodcars).subscribe((res) => {
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


  loadComuneOptions() {
    return this.elencoRumoreService.comuneSelectboxValuesCodiceSitoGestori(this.selectedProvinciaCode?.codice).pipe(
        tap(res => {
          this.selectedComuneOptions = res;
          const selectedComuneCodes = this.dataForm.get('comune').value;
          const filteredComune = res.filter(item => selectedComuneCodes.includes(item.codice));
          this.selectedComuneCode = filteredComune.map(item => ({
            label: `${item.denominazione} / ${item.codice}`,
            value: item.codice
          }));
        })
    );
  }

  saveData(){
    const dtoOut = new ElencoRumoreDto();
    dtoOut.numcodcar = this.dataForm.get('numcodcar').value;
    dtoOut.numcodcarold = this.dataForm.get('numcodcarold').value;
    dtoOut.denominazione = this.dataForm.get('denominazione').value;
    dtoOut.gestore = this.dataForm.get('gestore').value;
    dtoOut.attivita = this.dataForm.get('attivita').value;
    dtoOut.idaut = this.dataForm.get('idaut').value;
    const dateValue = this.dataForm.get('dataril').value;
    if (dateValue == '' || dateValue == null) {
      dtoOut.dataril = null;
    } else if (dateValue instanceof Date) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();

      dtoOut.dataril = `${year}-${month}-${day}`;
    }

    dtoOut.numautatt = this.dataForm.get('numautatt').value;
    dtoOut.tipaut = this.dataForm.get('tipaut').value;
    const dataprocValue = this.dataForm.get('dataproc').value;
    if (dataprocValue == '' || dataprocValue == null) {
      dtoOut.dataproc = null;
    } else if (dataprocValue instanceof Date) {
      const day = String(dataprocValue.getDate()).padStart(2, '0');
      const month = String(dataprocValue.getMonth() + 1).padStart(2, '0');
      const year = dataprocValue.getFullYear();

      dtoOut.dataproc = `${year}-${month}-${day}`;
    }

    dtoOut.protcoll = this.dataForm.get('protcoll').value;
    // dtoOut.provincia = this.dataForm.get('provincia')?.value;
    // dtoOut.comune = this.dataForm.get('comune')?.value;
    dtoOut.coordinatelat = this.dataForm.get('coordinatelat').value;
    dtoOut.coordinatelong = this.dataForm.get('coordinatelong').value;
    dtoOut.indirizzo = this.dataForm.get('indirizzo').value;
    dtoOut.nomesito = this.dataForm.get('nomesito').value;
    dtoOut.autesp = this.dataForm.get('autesp').value;
    dtoOut.sorgente = this.dataForm.get('sorgente')?.value;
    dtoOut.tipologiaoss = this.dataForm.get('tipologiaoss')?.value;
    dtoOut.schedaobb = this.dataForm.get('schedaobb').value;
    dtoOut.note = this.dataForm.get('note').value;
    dtoOut.linkcondivisia = this.dataForm.get('linkcondivisia').value;

    // Start loading data based on form selections
    let loadOperations : Observable<any> = of(true);

    if (this.dataForm.get('provincia').value) {
      this.selectedProvinciaOptions =  [
        {
          "codice": "MT",
          "denominazione": "Matera"
        },
        {
          "codice": "PZ",
          "denominazione": "Potenza"
        }
      ]
      this.selectedProvinciaCode = this.selectedProvinciaOptions.find(x => x.codice == this.dataForm.get('provincia').value);
      dtoOut.provincia = this.selectedProvinciaCode ? this.escapeString(this.selectedProvinciaCode.denominazione) : '';
    } else {
      dtoOut.provincia = '';
    }

    if (this.dataForm.get('comune').value) {
      loadOperations = loadOperations.pipe(
          switchMap(() => this.loadComuneOptions()),
          tap(() => {
            // Extract only the values (codice) from selectedComuneCode array
            dtoOut.comune = this.selectedComuneCode
                ? this.selectedComuneCode.map(item => item.label) // Collect only the values
                : '';
          })
      );
    } else {
      dtoOut.comune = '';
    }

    // Once all operations are completed, save the data
    loadOperations.subscribe(() => {
    if(this.newDialog == true){
        this.elencoRumoreService.postSaveNewElencoGestoriRumcemData(dtoOut).subscribe((res) => {
          if(res){
            this.newDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Elenco rumore inserito correttamente', life: 3000 });
            this.confirmationService.close();
            this.elencoRumoreService.getElencoGestoriRumcemData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.idaut - a?.idaut);
            });
          }
        },error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message, life: 3000 });
      })
      }else if(this.dataDialog== true){
        this.elencoRumoreService.putUpdatedOneDataElencoGestoriRumcem(this.numcodcar, dtoOut).subscribe((res) => {
          if(res){
            this.dataDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'MisureCem modificato correttamente', life: 3000 });
            this.confirmationService.close();
            this.elencoRumoreService.getElencoGestoriRumcemData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.idaut - a?.idaut);
            });
          }
        },error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message, life: 3000 });
        });
      }
    });
  }

  escapeString(value: string): string {
    return value.replace(/'/g, "''");
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

  selectedExportExcelForOneData() {
    const selectedData = this.datas.filter(data => this.selectedData.numcodcar  == data.numcodcar );
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
