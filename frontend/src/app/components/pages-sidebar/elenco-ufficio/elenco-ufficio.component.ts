import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {ElencoUfficioService} from "./elenco-ufficio.service";
import {ElencoUfficioDto} from "./elenco-ufficio-dto";
import {ModalService} from "../../../core/services/dialog.service";

@Component({
  selector: 'app-elenco-ufficio',
  templateUrl: './elenco-ufficio.component.html',
  styleUrls: ['./elenco-ufficio.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class ElencoUfficioComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  numcodprog: number;
  datas: ElencoUfficioDto[];
  data: ElencoUfficioDto;
  selectedDatas: ElencoUfficioDto[];
  selectedData: ElencoUfficioDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;

  dataForm: FormGroup;
  dialogStyles = {
    'width': '70vw',
  };

  dialogContentStyles = {
    'height': '80vh'
  };

  constructor(private fb: FormBuilder, private elencoUfficioService: ElencoUfficioService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private dialogService: ModalService) {
  }

  ngOnInit() {

    this.elencoUfficioService.getElencoGestoriUfficioData().subscribe(data => {
      this.datas = data;
    });

    this.initializeForm();


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
      numcodprog: [''],
      denominazione: [''],
      gestore: [''],
      cup: [''],
      dataatt: [''],
      numatt: [''],
      tipatt: [''],
    });
  }

  dataPatch(): void{
    this.dataForm.patchValue({
      numcodprog: this.data?.numcodprog || '',
      denominazione: this.data?.denominazione || '',
      gestore: this.data?.gestore || '',
      cup: this.data?.cup || '',
      dataatt: this.data?.dataatt || '',
      numatt: this.data?.numatt || '',
      tipatt: this.data?.tipatt || '',
    });
  }

  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: ElencoUfficioDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.numcodprog = data.numcodprog;
    this.isDataReadonly = false;
    this.dataPatch();

    const dataattValue = this.data.dataatt; // Assuming 'dataril' comes as a string
    if (dataattValue) {
      const formattedDateatt = new Date(dataattValue); // Convert to Date object
      this.dataForm.controls['dataatt'].setValue(formattedDateatt);
    } else {
      this.dataForm.controls['dataatt'].setValue(null);
    }
  }


  showData(data: ElencoUfficioDto) {
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
  deleteData(data: ElencoUfficioDto) {
    if(data.numcodprog){
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.elencoUfficioService.deleteSelectedDataElencoGestoriUfficio(data.numcodprog).subscribe(
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
      const numcodprog = this.selectedDatas[0].numcodprog;
      if(numcodprog){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.elencoUfficioService.deleteSelectedDataElencoGestoriUfficio(numcodprog).subscribe((res) => {
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
      const numcodprogs = this.selectedDatas.map(data => data.numcodprog);
      if(numcodprogs.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.elencoUfficioService.deletemultipleSelectedDatasElencoGestoriUfficio(numcodprogs).subscribe((res) => {
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

  saveData(){
    const dtoOut = new ElencoUfficioDto();
    dtoOut.numcodprog = this.dataForm.get('numcodprog').value;
    dtoOut.denominazione = this.dataForm.get('denominazione').value;
    dtoOut.gestore = this.dataForm.get('gestore').value;
    dtoOut.cup = this.dataForm.get('cup').value;
    const dateValue = this.dataForm.get('dataatt').value;
    if (dateValue == '' || dateValue == null) {
      dtoOut.dataatt = null;
    } else if (dateValue instanceof Date) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();

      dtoOut.dataatt = `${year}-${month}-${day}`;
    }
    dtoOut.numatt = this.dataForm.get('numatt').value;
    dtoOut.tipatt = this.dataForm.get('tipatt').value;
    if(this.newDialog == true){
        this.elencoUfficioService.postSaveNewElencoGestoriUfficioData(dtoOut).subscribe((res) => {
          if(res){
            this.confirmationService.confirm({
              message: 'Elenco Ufficio inserito correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.elencoUfficioService.getElencoGestoriUfficioData().subscribe(data => {
                  this.datas = data;
                });
                this.confirmationService.close();
                this.newDialog = false;
              }
            });
          }else{
            console.log('there is an error while posting')
          }
        })
      }else if(this.dataDialog== true){
        this.elencoUfficioService.putUpdatedOneDataElencoGestoriUfficio(this.numcodprog, dtoOut).subscribe((res) => {
          if(res){
            this.confirmationService.confirm({
              message: 'Elenco Ufficio modificato correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.elencoUfficioService.getElencoGestoriUfficioData().subscribe(data => {
                  this.datas = data;
                });
                this.confirmationService.close();
                this.dataDialog = false;
              }
            });
          }else{
            console.log('there is an error while updating')
          }
        },(error) => {
          this.newDialog = false;
          this.dataDialog = false;
          this.dialogService.openError(error.error.error?.sqlMessage)
        })
      }
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
    const selectedData = this.datas.filter(data => this.selectedData.numcodprog  == data.numcodprog );
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
