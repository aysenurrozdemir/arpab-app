import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {SondestrumService} from "./sondestrum.service";
import {SondestrumDto} from "./sondestrum-dto";
@Component({
  selector: 'app-strumenti-cem',
  templateUrl: './sondestrum.component.html',
  styleUrls: ['./sondestrum.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None,

})
export class SondestrumComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  selectedIdProt: number;
  datas: SondestrumDto[];
  data: SondestrumDto;
  selectedDatas: SondestrumDto[];
  selectedData: SondestrumDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;

  dialogStyles = {
    'width': '70vw',
  };

  dialogContentStyles = {
    'height': '80vh'
  };


  dataForm: FormGroup;

  constructor(private fb: FormBuilder, private sondestrumService: SondestrumService,
              private messageService: MessageService, private confirmationService: ConfirmationService) {
  }

  ngOnInit() {

    this.sondestrumService.getSondestrumData().subscribe(data => {
      this.datas = data.sort((a, b) => b?.id_sond - a?.id_sond);
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.dataForm = this.fb.group({
      id_sond: [''],
      ditta: [''],
      denominazione: [''],
      statusstrumento: [''],
      modello: [''],
      serialnumber: [''],
      certificatotaratura: [''],
      datataratura: [''],
      datascadenza: [''],
      note: [''],
      sede: [''],
      legenda: [''],
      altrenote: [''],
      ubicazione: [''],
      ninventario: [''],
      tipo: [''],
      rangedifrequenza: [''],
      gammadimisura: [''],
      sovraccarico: [''],
      risoluzione: [''],
      misuraisotropsingasse: [''],
      altafrequenza: [''],
      bassafrequenza: [''],
      bandalarga: [''],
      bandastretta: ['']
    });
  }


  dataPatch(): void {
    this.dataForm.patchValue({
      id_sond: this.data?.id_sond || '',
      ditta: this.data?.ditta || '',
      denominazione: this.data?.denominazione || '',
      statusstrumento: this.data?.statusstrumento || '',
      modello: this.data?.modello || '',
      serialnumber: this.data?.serialnumber || '',
      certificatotaratura: this.data?.certificatotaratura || '',
      datataratura: this.data?.datataratura || '',
      datascadenza: this.data?.datascadenza || '',
      note: this.data?.note || '',
      sede: this.data?.sede || '',
      legenda: this.data?.legenda || '',
      altrenote: this.data?.altrenote || '',
      ubicazione: this.data?.ubicazione || '',
      ninventario: this.data?.ninventario || '',
      tipo: this.data?.tipo || '',
      rangedifrequenza: this.data?.rangedifrequenza || '',
      gammadimisura: this.data?.gammadimisura || '',
      sovraccarico: this.data?.sovraccarico || '',
      risoluzione: this.data?.risoluzione || '',
      misuraisotropsingasse: this.data?.misuraisotropsingasse || '',
      altafrequenza: this.data?.altafrequenza || '',
      bassafrequenza: this.data?.bassafrequenza || '',
      bandalarga: this.data?.bandalarga || '',
      bandastretta: this.data?.bandastretta || ''
    });
  }

  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: SondestrumDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.selectedIdProt = data.id_sond;
    this.isDataReadonly = false;
    this.dataPatch();

    const datataratura = this.data.datataratura; // Assuming 'dataril' comes as a string
    if (datataratura) {
      const formatteddatataratura = new Date(datataratura); // Convert to Date object
      this.dataForm.controls['datataratura'].setValue(formatteddatataratura);
    } else {
      this.dataForm.controls['datataratura'].setValue(null);
    }

    const datascadenza = this.data.datascadenza; // Assuming 'dataril' comes as a string
    if (datascadenza) {
      const formatteddatascadenza = new Date(datascadenza); // Convert to Date object
      this.dataForm.controls['datascadenza'].setValue(formatteddatascadenza);
    } else {
      this.dataForm.controls['datascadenza'].setValue(null);
    }
  }


  showData(data: SondestrumDto) {
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
  deleteData(data: SondestrumDto) {
    if(data.id_sond){
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.sondestrumService.deleteSelectedDataSondestrum(data.id_sond).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
            this.confirmationService.close();
            window.location.reload();
          })
        }
      });
    }else{
      console.log('pls select a row to be deleted!')
    }
  }

  deleteSelectedDatas() {
    if (this.selectedDatas.length == 1) {
      const id_stru = this.selectedDatas[0].id_sond;
      if(id_stru){
        this.confirmationService.confirm({
          message: 'Are you sure you want to delete?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.sondestrumService.deleteSelectedDataSondestrum(id_stru).subscribe(() => {
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Data Deleted', life: 3000 });
              this.confirmationService.close();
              window.location.reload();
            })
          }
        });
      }
    } else if(this.selectedDatas.length > 1){
      const id_strus = this.selectedDatas.map(data => data.id_sond);
      if(id_strus.length > 1){
        this.confirmationService.confirm({
          message: 'Are you sure you want to delete?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.sondestrumService.deletemultipleSelectedDatasSondestrum(id_strus).subscribe(() => {
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

  saveData(){
    const dtoOut = new SondestrumDto();
    dtoOut.ditta = this.dataForm.get('ditta').value;
    dtoOut.denominazione = this.dataForm.get('denominazione').value;
    dtoOut.statusstrumento = this.dataForm.get('statusstrumento').value;
    dtoOut.modello = this.dataForm.get('modello').value;
    dtoOut.serialnumber = this.dataForm.get('serialnumber').value;
    dtoOut.certificatotaratura = this.dataForm.get('certificatotaratura').value;


    // dtoOut.datataratura = this.dataForm.get('datataratura').value;
    // dtoOut.datascadenza = this.dataForm.get('datascadenza').value;


    const datataratura = this.dataForm.get('datataratura').value;
    if (datataratura == '' || datataratura == null) {
      dtoOut.datataratura = null;
    } else if (datataratura instanceof Date) {
      const day = String(datataratura.getDate()).padStart(2, '0');
      const month = String(datataratura.getMonth() + 1).padStart(2, '0');
      const year = datataratura.getFullYear();

      dtoOut.datataratura = `${year}-${month}-${day}`;
    }

    const datascadenza = this.dataForm.get('datascadenza').value;
    if (datascadenza == '' || datascadenza == null) {
      dtoOut.datascadenza = null;
    } else if (datascadenza instanceof Date) {
      const day = String(datascadenza.getDate()).padStart(2, '0');
      const month = String(datascadenza.getMonth() + 1).padStart(2, '0');
      const year = datascadenza.getFullYear();

      dtoOut.datascadenza = `${year}-${month}-${day}`;
    }
    dtoOut.note = this.dataForm.get('note').value;
    dtoOut.sede = this.dataForm.get('sede').value;
    dtoOut.legenda = this.dataForm.get('legenda').value;
    dtoOut.altrenote = this.dataForm.get('altrenote').value;
    dtoOut.ubicazione = this.dataForm.get('ubicazione').value;
    dtoOut.ninventario = this.dataForm.get('ninventario').value;
    dtoOut.tipo = this.dataForm.get('tipo').value;
    dtoOut.rangedifrequenza = this.dataForm.get('rangedifrequenza').value;
    dtoOut.gammadimisura = this.dataForm.get('gammadimisura').value;
    dtoOut.sovraccarico = this.dataForm.get('sovraccarico').value;
    dtoOut.risoluzione = this.dataForm.get('risoluzione').value;
    dtoOut.misuraisotropsingasse = this.dataForm.get('misuraisotropsingasse').value;
    dtoOut.altafrequenza = this.dataForm.get('altafrequenza').value;
    dtoOut.bassafrequenza = this.dataForm.get('bassafrequenza').value;
    dtoOut.bandalarga = this.dataForm.get('bandalarga').value;
    dtoOut.bandastretta = this.dataForm.get('bandastretta').value;
      if(this.newDialog == true){
        this.sondestrumService.postSaveNewSondestrum(dtoOut).subscribe((res) => {
          if(res){
            // status code will be added acc to be response
            this.newDialog = false;
            this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Inserito correttamente', life: 3000});
            this.confirmationService.close();
            this.sondestrumService.getSondestrumData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.id_sond - a?.id_sond);
            });
          }else{
            console.log('there is an error while posting')
          }
        }, error => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: error.error.message, life: 3000});
        });
      }else if(this.dataDialog== true){
        this.sondestrumService.putUpdatedOneDataSondestrum(this.selectedIdProt, dtoOut).subscribe((res) => {
          if(res){
            // status code will be added acc to be response
            this.dataDialog = false;
            this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Modificato correttamentei', life: 3000});
            this.confirmationService.close();
            this.sondestrumService.getSondestrumData().subscribe(data => {
              this.datas = data.sort((a, b) => b?.id_sond - a?.id_sond);
            }, error => {
              this.messageService.add({severity: 'error', summary: 'Error', detail: error.error.message, life: 3000});
            });
          }else{
            console.log('there is an error while updating')
          }
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
    const selectedData = this.datas.filter(data => this.selectedData.id_sond  == data.id_sond );
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
