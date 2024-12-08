import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {AnagraficaArpabService} from "./anagrafica-arpab.service";
import {AnagraficaArpabDto} from "./anagrafica-arpab-dto";
import {ModalService} from "../../../core/services/dialog.service";
@Component({
  selector: 'app-gestori-rumore',
  templateUrl: './anagrafica-arpab.component.html',
  styleUrls: ['./anagrafica-arpab.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class AnagraficaArpabComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  selectedIdAnaarpab: number;
  datas: AnagraficaArpabDto[];
  data: AnagraficaArpabDto;
  selectedDatas: AnagraficaArpabDto[];
  selectedData: AnagraficaArpabDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;
  dataForm: FormGroup;

  constructor(private fb: FormBuilder, private anaarpabService: AnagraficaArpabService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private dialogService: ModalService) {
  }

  ngOnInit() {
    this.anaarpabService.getAnagraficaArpabData().subscribe(data => {
      this.datas = data.sort((a, b) => b?.id_ana - a?.id_ana);
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.dataForm = this.fb.group({
      denominazione: [''],
      nome: [''],
      cognome: [''],
      email: [''],
    });
  }


  dataPatch(): void {
    this.dataForm.patchValue({
      denominazione: this.data?.denominazione || '',
      nome: this.data?.nome || '',
      cognome: this.data?.cognome || '',
      email: this.data?.email || '',
    });
  }


  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: AnagraficaArpabDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.selectedIdAnaarpab = data.id_ana;
    this.isDataReadonly = false;
    this.dataPatch();
  }


  showData(data: AnagraficaArpabDto) {
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

  deleteData(data: AnagraficaArpabDto) {
    if(data.id_ana){
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.anaarpabService.deleteSelectedDataAnagraficaArpab(data.id_ana).subscribe((res) => {
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
      const id_ana = this.selectedDatas[0].id_ana;
      if(id_ana){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.anaarpabService.deleteSelectedDataAnagraficaArpab(id_ana).subscribe((res) => {
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
      const id_anas = this.selectedDatas.map(data => data.id_ana);
      if(id_anas.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.anaarpabService.deletemultipleSelectedDatasAnagraficaArpab(id_anas).subscribe((res) => {
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
      console.log('Seleziona una riga da eliminare');
    }
  }

  saveData(){
    const dtoOut = new AnagraficaArpabDto();
    dtoOut.denominazione = this.dataForm.get('denominazione').value;
    dtoOut.nome = this.dataForm.get('nome').value;
    dtoOut.cognome = this.dataForm.get('cognome').value;
    dtoOut.email = this.dataForm.get('email').value;
      if(this.newDialog == true){
        this.anaarpabService.postSaveNewAnagraficaArpabData(dtoOut).subscribe((res) => {
          if(res){
            this.hideDataDialog();
            // status code will be added acc to be response
            this.confirmationService.confirm({
              message: 'Dati inserito correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.anaarpabService.getAnagraficaArpabData().subscribe(data => {
                  this.datas = data.sort((a, b) => b?.id_ana - a?.id_ana);
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
        this.anaarpabService.putUpdatedOneDataAnagraficaArpab(this.selectedIdAnaarpab, dtoOut).subscribe((res) => {
          if(res){
            this.hideDataDialog();
            this.confirmationService.confirm({
              message: 'Dati modificato correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.anaarpabService.getAnagraficaArpabData().subscribe(data => {
                  this.datas = data.sort((a, b) => b?.id_ana - a?.id_ana);
                });
                this.confirmationService.close();
                this.dataDialog = false;
              }
            });
          }else{
            console.log('there is an error while updating')
          }
        },
            (error) => {
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
    const selectedData = this.datas.filter(data => this.selectedData.id_ana  == data.id_ana );
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
