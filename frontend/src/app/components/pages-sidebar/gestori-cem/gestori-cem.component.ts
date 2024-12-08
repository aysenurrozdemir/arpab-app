import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {GestoriCemService} from "./gestori-cem.service";
import {GestoriCemDto} from "./gestori-cem-dto";
import {ModalService} from "../../../core/services/dialog.service";
@Component({
  selector: 'app-gestori-cem',
  templateUrl: './gestori-cem.component.html',
  styleUrls: ['./gestori-cem.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class GestoriCemComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  selectedIdGestore: number;
  datas: GestoriCemDto[];
  data: GestoriCemDto;
  selectedDatas: GestoriCemDto[];
  selectedData: GestoriCemDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;
  dataForm: FormGroup;

  constructor(private fb: FormBuilder, private gestoriCemService: GestoriCemService,
              private messageService: MessageService, private confirmationService: ConfirmationService,
              private dialogService: ModalService) {
  }

  ngOnInit() {
    this.gestoriCemService.getGestoriCemData().subscribe(data => {
      this.datas = data.sort((a, b) => b?.idgestore - a?.idgestore);
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.dataForm = this.fb.group({
      nomegestore: ['', Validators.required],
    });
  }


  dataPatch(): void {
    this.dataForm.patchValue({
      nomegestore: this.data?.nomegestore || '',
    });
  }


  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: GestoriCemDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.selectedIdGestore = data.idgestore;
    this.isDataReadonly = false;
    this.dataPatch();
  }


  showData(data: GestoriCemDto) {
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

  deleteData(data: GestoriCemDto) {
    if(data.idgestore){
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Conferma',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.gestoriCemService.deleteSelectedDataGestoriCem(data.idgestore).subscribe((res) => {
                if (res.message === 'Dati eliminati con successo') {
                  setTimeout(() => {
                    this.showDeletionConfirmation();
                  }, 500);
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
      const idgestore = this.selectedDatas[0].idgestore;
      if(idgestore){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.gestoriCemService.deleteSelectedDataGestoriCem(idgestore).subscribe((res) => {
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
      const idgestores = this.selectedDatas.map(data => data.idgestore);
      if(idgestores.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.gestoriCemService.deletemultipleSelectedDatasGestoriCem(idgestores).subscribe((res) => {
                  if(res.message == 'Dati eliminati con successo'){
                    setTimeout(() => {
                      this.showDeletionsConfirmation();
                    }, 500);
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
  showDeletionConfirmation() {
    this.confirmationService.confirm({
      message: 'Gestori Cem eliminato',
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
      message: 'Gestori Cem eliminati',
      header: 'Info',
      acceptLabel: 'Ok',
      rejectVisible: false,
      accept: () => {
        window.location.reload();
      },
    });
  }
  saveData(){
    const dtoOut = new GestoriCemDto();
    dtoOut.nomegestore = this.dataForm.get('nomegestore').value;
    if( dtoOut.nomegestore){
      if(this.newDialog == true){
        this.gestoriCemService.postSaveNewGestoriCemData(dtoOut).subscribe((res) => {
          if(res){
            // status code will be added acc to be response
            this.hideDataDialog();
            this.confirmationService.confirm({
              message: 'Gestore inserito correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.gestoriCemService.getGestoriCemData().subscribe(data => {
                  this.datas = data.sort((a, b) => b?.idgestore - a?.idgestore);
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
        this.gestoriCemService.putUpdatedOneDataGestoriCem(this.selectedIdGestore, dtoOut).subscribe((res) => {
          if(res){
            this.hideDataDialog();
            this.confirmationService.confirm({
              message: 'Gestori Sito modificato correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.gestoriCemService.getGestoriCemData().subscribe(data => {
                  this.datas = data.sort((a, b) => b?.idgestore - a?.idgestore);
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
    }else{
      console.log('pls enter required values')
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
    const selectedData = this.datas.filter(data => this.selectedData.idgestore  == data.idgestore );
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
