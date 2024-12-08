import {Component, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {MisureCemService} from "./misure-cem.service";
import {MisureCemDto} from "./misure-cem-dto";
import {ProtocolloCemDto} from "../protocollo-cem/protocollo-cem-dto";
import {ProtocolloCemService} from "../protocollo-cem/protocollo-cem.service";
import {map, Observable, of, switchMap, tap} from "rxjs";
@Component({
  selector: 'app-misure-cem',
  templateUrl: './misure-cem.component.html',
  styleUrls: ['./misure-cem.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class MisureCemComponent implements OnInit{

  dataDialog: boolean;
  isMaximized: boolean = false;
  newDialog: boolean;
  dataShowDialog: boolean;
  selectedIdProt: number;
  datas: MisureCemDto[];
  data: MisureCemDto;
  selectedDatas: MisureCemDto[];
  selectedData: MisureCemDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;


  attivitaOptions = [
    { label: 'VERIFICA SITO', value: 'VERIFICA SITO' },
    { label: 'MONITORAGGIO', value: 'MONITORAGGIO' },
    { label: 'SIMULAZIONE', value: 'SIMULAZIONE' },
    { label: 'MODELLO: EMLAB', value: 'MODELLO: EMLAB' }
  ];
  tipologiaOptions = [
    { label: 'RF', value: 'RF' },
    { label: 'ELF', value: 'ELF' }
  ];
  regioneOptions: any[];
  provinciaOptions: any[];
  comuneOptions: any[];
  numcodsitoOptions: any[] = [];
  modellostrumOptions: any[] = [];
  sondaCollegataOptions: any[] = [];
  taraturastrumOptions: any[];
  selectedModstrumPopupData: any;
  dataModstrumPopupDialog: boolean;

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

  dataForm: FormGroup;
  italianLocale = {
    firstDayOfWeek: 1,
    dayNames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
    monthNames: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    monthNamesShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    today: 'Oggi',
    clear: 'Pulisci',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Settimana'
  };
  constructor(private fb: FormBuilder, private misureCemService: MisureCemService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private protocolloCemService: ProtocolloCemService,
              private renderer: Renderer2,) {

    // this.misureCemService.comuneSelectboxValuesMisureCem().subscribe(res => {
    //   this.comuneOptions = res;
    // })
    // this.misureCemService.provinciaSelectboxValuesMisureCem().subscribe(res => {
    //   this.provinciaOptions = res;
    // })

  }

  ngOnInit() {
    this.misureCemService.getMisureCemData().subscribe(data => {
      this.datas = data.sort((a, b) => b?.idimiscem - a?.idimiscem);
    });
    this.initializeForm();

    this.misureCemService.regioneSelectboxValuesCodiceSitoGestori().subscribe(res => {
      this.regioneOptions = res;
    })

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

    // this.protocolloCemService.numcodsitoSelectboxValuesProtocolloCem().subscribe(res => {
    //   if (res && Array.isArray(res)) {
    //     this.numcodsitoOptions = res.filter(item => item.numcodsito !== '').map(item => item?.numcodsito + '/' + item?.gestore);
    //     console.log(this.numcodsitoOptions)
    //   }
    // })
    this.misureCemService.numcodsitoSelectboxValuesRilevazioniSito().subscribe(res => {
      this.numcodsitoOptions = res
          .filter(item => item.numcodsito|| item.gestore)  // Filter out entries with both fields null or empty
          .map(item => ({
            label: `${item.numcodsito || 'null'} / ${item.gestore || 'null'}`,  // Use 'N/A' for display if null
            value: item.numcodsito
          }));
    });

    this.misureCemService.modellostrumSelectboxValuesRilevazioniSito().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.modellostrumOptions = res
            .filter(item => item.modello || item.serialnumber)  // Filter out entries with both fields null or empty
            .map(item => ({
              label: `${item.modello || 'null'} / ${item.serialnumber || 'null'}`,  // Use 'N/A' for display if null
              value: item.modello
            }));
      }
    });
    this.misureCemService.sondaCollegataSelectboxValuesRilevazioniSito().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.sondaCollegataOptions = res
            .filter(item => item.sonda)  // Filter out entries with both fields null or empty
            .map(item => ({
              label: `${item.sonda}`,
              value: item.sonda
            }));
      }
    });
    this.misureCemService.taraturastrumSelectboxValuesRilevazioniSito().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.taraturastrumOptions = res
            .filter(item => item.tartstrum)  // Filter out entries with both fields null or empty
            .map(item => ({
              label: `${item.tartstrum}}`,
              value: item
            }));
      }
    });

    // this.loadInitialData()
  }

  onRegioneChange(event: any) {
    const selectedRegioneCode = event.value;
    this.dataForm.get('provincia')?.setValue(null);
    this.dataForm.get('comune')?.setValue(null);
    this.provinciaOptions = [];
    this.comuneOptions = [];

    if (selectedRegioneCode) {
      this.misureCemService.provinciaSelectboxValuesMisureCem(selectedRegioneCode).subscribe(res => {
        this.provinciaOptions = res;
      });
    }
  }

  onProvinciaChange(event: any) {
    const selectedProvinciaCode = event.value;
    this.dataForm.get('comune')?.setValue(null);
    this.comuneOptions = [];

    if (selectedProvinciaCode) {
      this.misureCemService.comuneSelectboxValuesMisureCem(selectedProvinciaCode).subscribe(res => {
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

// Assuming `data?.modstrum` is the JSON string containing your data
  parseDataFields(jsonString: string): string[] {
    try {
      // Parse the JSON string to a JavaScript object
      const dataArray = JSON.parse(jsonString);

      // Check if the parsed data is an array
      if (Array.isArray(dataArray)) {
        // Map to extract only `modello` values
        return dataArray.map(item => item.modello).filter(modello => modello);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }

    // Return an empty array if there's an error or no valid data
    return [];
  }


  navigateTo() {
    const url = 'https://www.dropfacile.it/arpab/';
    window.open(url, '_blank');
  }
  showModstrumPopupData(data: any){
    this.selectedModstrumPopupData = data;
    this.dataModstrumPopupDialog = true;
    this.isDataReadonly =  true;
  }
  // onRowExpand(event: any): void {
  //   const numcodsito = event.data.numcodsito;
  //   if(numcodsito){
  //     this.fetchSchedaRadioElettrica(numcodsito);
  //   }
  // }
  // fetchSchedaRadioElettrica(numcodsito: string): void {
  //   this.codiceSitoGestoriService.radioSchedaElettricaValuesCodiceSitoGestori(numcodsito).subscribe(
  //       res => {
  //         console.log('API Response:', res);
  //         if (res && Array.isArray(res)) {
  //           this.schedaRadioElettricaTableValue = res;
  //           this.tableHeaders = res.length > 0 ? Object.keys(res[0]) : [];
  //         } else {
  //           console.error('Unexpected response format:', res);
  //           this.schedaRadioElettricaTableValue = [];
  //           this.tableHeaders = [];
  //         }
  //         this.cdr.detectChanges();
  //       },
  //       err => {
  //         console.error('API Error:', err);
  //         this.schedaRadioElettricaTableValue = [];
  //         this.tableHeaders = [];
  //       }
  //   );
  // }
  getModstrumForClickedPopup(modstrum: any){
    this.misureCemService.getStrumentoForClickedPopup(modstrum).subscribe((data: any) => {
      console.log(data)
        this.showModstrumPopupData(data[0]);
    }, error => {
      console.error('Error fetching data:', error);
      // Handle error as needed
    });
  }
  selectedExportExcelForOneDataModstrumPopup(selectedData: any): void {
    const data: any[] = [selectedData];
    console.log(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  hideModstrumPopupDataDialog() {
    this.dataModstrumPopupDialog = false;
  }
  onHideDialog() {
    // Custom logic when the dialog is closed
  }
  initializeForm(): void {
    this.dataForm = this.fb.group({
      idimiscem: [''],
      sopralluogo: [''],
      tipologia: [''],
      regione: [null],
      provincia: [{ value: null }],
      comune: [{ value: null }],
      codsito: [''],
      data: [''],
      modstrum: [''],
      sonda: [''],
      tartstrum: [''],
      puntodimisura: [''],
      descpuntomis: [''],
      latitudine: [''],
      longitudine: [''],
      valeffrmsvm: [''],
      valeffrmsut: [''],
      permcontgio: [''],
      limleggevm: [''],
      limleggeut: [''],
      rangefreq: [''],
      gammamisura: [''],
      sovraccarico: [''],
      risoluzione: [''],
      misisotrop: ['']
    });
  }


  dataPatch(): void {
    this.dataForm.patchValue({
      idimiscem: this.data?.idimiscem || '',
      sopralluogo: this.data?.sopralluogo || '',
      tipologia: this.data?.tipologia || '',
      regione: this.data?.regione || '',
      provincia: this.data?.provincia || '',
      comune: this.data?.comune || '',
      codsito: this.data?.codsito || '',
      data: this.data?.data || '',
      modstrum: this.data?.modstrum || '',
      sonda: this.data?.sonda || '',
      tartstrum: this.data?.tartstrum || '',
      puntodimisura: this.data?.puntodimisura || '',
      descpuntomis: this.data?.descpuntomis || '',
      latitudine: this.data?.latitudine || '',
      longitudine: this.data?.longitudine || '',
      valeffrmsvm: this.data?.valeffrmsvm || '',
      valeffrmsut: this.data?.valeffrmsut || '',
      permcontgio: this.data?.permcontgio || '',
      limleggevm: this.data?.limleggevm || '',
      limleggeut: this.data?.limleggeut || '',
      rangefreq: this.data?.rangefreq || '',
      gammamisura: this.data?.gammamisura || '',
      sovraccarico: this.data?.sovraccarico || '',
      risoluzione: this.data?.risoluzione || '',
      misisotrop: this.data?.misisotrop || ''
    });
  }

  openNewData() {
    this.data = {}; // Reset data
    this.selectedRegionCode = null; // Reset selected codes
    this.selectedProvinciaCode = null;
    this.selectedComuneCode = null;
    this.dataPatch(); // Patch form with empty values
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: MisureCemDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.selectedIdProt = data.idimiscem;
    this.isDataReadonly = false;
    this.dataPatch();

    const dataValue = this.dataForm.get('data').value;
    const formattedDate = dataValue ? new Date(dataValue) : null;
    this.dataForm.controls['data'].setValue(formattedDate);

    let regioneValue = this.data.regione;
    let provincaValue = this.data.provincia;
    let comuneValue = this.data.comune;
    let regioneCodeValue: any;
    let provinciaCodeValue: any;
    let comuneCodeValue: any;
    if(regioneValue){
      this.misureCemService.regioneSelectboxValuesCodiceSitoGestori().subscribe(res => {
        const regioneValues = res;
        regioneCodeValue = regioneValues.find(x => x.denominazione == regioneValue)
        this.dataForm.controls['regione'].setValue(regioneCodeValue.codice);
        if(regioneCodeValue && provincaValue){
          this.misureCemService.provinciaSelectboxValuesMisureCem(regioneCodeValue.codice).subscribe(res => {
            this.provinciaOptions = res;
            provinciaCodeValue = this.provinciaOptions.find(x => x.denominazione == provincaValue)
            console.log(provinciaCodeValue)
            this.dataForm.controls['provincia'].setValue(provinciaCodeValue.codice);
            if(regioneCodeValue && provinciaCodeValue && comuneValue){
              this.misureCemService.comuneSelectboxValuesMisureCem(provinciaCodeValue.codice).subscribe(res => {
                this.comuneOptions = res;
                if(this.comuneOptions && this.comuneOptions.length > 0){
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



  showData(data: MisureCemDto) {
    this.data = {...data};
    this.selectedData = this.data;
    this.dataShowDialog = true;
    this.isDataReadonly =  true;
    this.dataPatch();
  }

  loadRegioneOptions() {
    return this.misureCemService.regioneSelectboxValuesCodiceSitoGestori().pipe(
        tap(res => {
          this.selectedRegioneOptions = res;
          this.selectedRegionCode = this.selectedRegioneOptions.find(x => x.codice == this.dataForm.get('regione').value);
        })
    );
  }

  loadProvinciaOptions() {
    return this.misureCemService.provinciaSelectboxValuesMisureCem(this.selectedRegionCode?.codice).pipe(
        tap(res => {
          this.selectedProvinciaOptions = res;
          this.selectedProvinciaCode = this.selectedProvinciaOptions.find(x => x.codice == this.dataForm.get('provincia').value);
        })
    );
  }

  loadComuneOptions() {
    return this.misureCemService.comuneSelectboxValuesMisureCem(this.selectedProvinciaCode?.codice).pipe(
        tap(res => {
          this.selectedComuneOptions = res;
          this.selectedComuneCode = this.selectedComuneOptions.find(x => x.codice == this.dataForm.get('comune').value);
        })
    );
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
  deleteData(data: MisureCemDto) {
    if(data.idimiscem){
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.misureCemService.deleteSelectedDataMisureCem(data.idimiscem).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
            this.confirmationService.close();
            window.location.reload();
          })
        },
      });
    }else{
      console.log('pls select a row to be deleted!')
    }
  }

  deleteSelectedDatas() {
    if (this.selectedDatas.length == 1) {
      const idprot = this.selectedDatas[0].idimiscem;
      if(idprot){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.misureCemService.deleteSelectedDataMisureCem(idprot).subscribe(() => {
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
              this.confirmationService.close();
              window.location.reload();
            })
          }
        });
      }
    } else if(this.selectedDatas.length > 1){
      const idprots = this.selectedDatas.map(data => data.idimiscem);
      if(idprots.length > 1){
        this.confirmationService.confirm({
          message: 'Are you sure you want to delete?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.misureCemService.deletemultipleSelectedDatasMisureCem(idprots).subscribe(() => {
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
              this.confirmationService.close();
              window.location.reload();
            });
          }
        });
      }
    }else{
      console.log('Please select rows to be deleted!');
    }
  }

  saveData() {
    const dtoOut = new MisureCemDto();
    dtoOut.sopralluogo = this.dataForm.get('sopralluogo').value;
    dtoOut.tipologia = this.dataForm.get('tipologia').value;
    dtoOut.codsito = this.dataForm.get('codsito').value;
    const dateValue = this.dataForm.get('data').value;
    if (dateValue == '' || dateValue == null) {
      dtoOut.data = null;
    } else if (dateValue instanceof Date) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();
      dtoOut.data = `${year}-${month}-${day}`;
    }

    dtoOut.modstrum = this.dataForm.get('modstrum').value;
    dtoOut.sonda = this.dataForm.get('sonda').value;
    dtoOut.tartstrum = this.dataForm.get('tartstrum').value;
    dtoOut.puntodimisura = this.dataForm.get('puntodimisura').value;
    dtoOut.descpuntomis = this.dataForm.get('descpuntomis').value;
    dtoOut.latitudine = this.dataForm.get('latitudine').value;
    dtoOut.longitudine = this.dataForm.get('longitudine').value;

    // Start loading data based on form selections
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

    // Once all operations are completed, save the data
    loadOperations.subscribe(() => {
      if (this.newDialog) {
        this.misureCemService.postSaveNewMisureCemData(dtoOut).subscribe((res) => {
          if (res) {
            this.newDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'MisureCem inserito correttamente', life: 3000 });
            this.confirmationService.close();
            this.misureCemService.getMisureCemData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.idimiscem - a?.idimiscem);
            });
          }
        }, error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message, life: 3000 });
        });
      } else if (this.dataDialog) {
        this.misureCemService.putUpdatedOneDataMisureCem(this.selectedIdProt, dtoOut).subscribe((res) => {
          if (res) {
            this.dataDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'MisureCem Dati aggiornati', life: 3000 });
            this.confirmationService.close();
            this.misureCemService.getMisureCemData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.idimiscem - a?.idimiscem);
            });
          }
        }, error => {
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
    const selectedData = this.datas.filter(data => this.selectedData.idimiscem  == data.idimiscem );
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
