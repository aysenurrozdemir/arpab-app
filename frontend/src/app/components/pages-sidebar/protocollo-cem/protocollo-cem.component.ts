import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {ProtocolloCemService} from "./protocollo-cem.service";
import {ProtocolloCemDto} from "./protocollo-cem-dto";
import {ModalService} from "../../../core/services/dialog.service";
import {CodiceSitoGestoriPopUpDto} from "../codice-sito-gestori/codice-sito-gestori-dto";
import {EsportaDocumentiService} from "../esporta-documenti/esporta-documenti-service";
import {ElencoRumoreDto} from "../elenco-rumore/elenco-rumore-dto";
import {ElencoRumoreComponent} from "../elenco-rumore/elenco-rumore.component";
import {ElencoUfficioDto} from "../elenco-ufficio/elenco-ufficio-dto";
@Component({
  selector: 'app-protocollo-cem',
  templateUrl: './protocollo-cem.component.html',
  styleUrls: ['./protocollo-cem.component.css'],
  providers: [ConfirmationService, MessageService, ModalService],
  encapsulation: ViewEncapsulation.None,
})
export class ProtocolloCemComponent implements OnInit{

  dataDialog: boolean;
  newDialog: boolean;
  dataShowDialog: boolean;
  dataCodiceSitoPopupDialog: boolean;
  dataElencoRumorePopupDialog: boolean;
  dataElencoUffPopupDialog: boolean;
  dataProtocolandProtriferimePopupDialog: boolean;
  selectedCodiceSitoPopupData: CodiceSitoGestoriPopUpDto;
  selectedElencoRumorePopupData: ElencoRumoreDto;
  selectedElencoUffPopupData: ElencoUfficioDto;
  selectedProtocolandProtriferimePopupData: ProtocolloCemDto;
  selectedIdProt: number;
  datas: ProtocolloCemDto[];
  data: ProtocolloCemDto;
  selectedDatas: ProtocolloCemDto[];
  selectedData: ProtocolloCemDto;
  submittedData: boolean;
  isDataReadonly: boolean = false;
  isMaximized: boolean = false;

  sensoOptions: any[];
  numprotcollOptions: any[];
  subassegnazioneOptions: any[];
  tematicaOptions: any[];
  categoriaOptions: any[];
  sottocategoriaOptions: any[] = [];
  sottocategoriaOptions1: any[] = [];
  sottocategoriaOptions2: any[] = [];
  sottocategoriaOptions3: any[]  = [];
  sottocategoriaOptions4: any[] = [];
  sottocategoriaOptionsRum: any[] = [];
  sottocategoriaOptionsUff: any[] = [];
  azioneOptions: any[];
  protriferimeOptions: any[];
  numcodsitoOptions: any[];
  elencorumoreOptions: any[];
  elencoufficioOptions: any[];
  statoimpiantoOptions: any[];
  statoproceduraOptions: any[];
  dataForm: FormGroup;
  dialogStyles = {
    'width': '75vw',
  };
  dialogContentStyles = {
    'height': '80vh'
  };

  constructor(private fb: FormBuilder, 
              private protocolloCemService: ProtocolloCemService,
              private confirmationService: ConfirmationService,
              private dialogService: ModalService,
              private esportaDocumentiService: EsportaDocumentiService,)
  {
    this.protocolloCemService.sensoSelectboxValuesProtocolloCem().subscribe(res => {
      this.sensoOptions = res;
    })
    this.protocolloCemService.numprotcollSelectboxValuesProtocolloCem().subscribe(res => {
      if (res && Array.isArray(res)) {
        const data = res.filter(item => item.protocollo !== '').map(item => item.protocollo);
        this.numprotcollOptions = data
            .filter(item => item !== null)
            .map(item => ({ label: item, value: item }));
        this.protriferimeOptions = this.numprotcollOptions;
      }
    })
    this.protocolloCemService.tematicaSelectboxValuesProtocolloCem().subscribe(res => {
      this.tematicaOptions = res;
    })
    // this.protocolloCemService.categoriaSelectboxValuesProtocolloCem().subscribe(res => {
    //   this.categoriaOptions = res;
    // })
    // this.protocolloCemService.sottcatcemSelectboxValuesProtocolloCem().subscribe(res => {
    //   this.sottocategoriaOptions = res;
    // })
    this.protocolloCemService.azioneSelectboxValuesProtocolloCem().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.azioneOptions = res.filter(item => item.valoretemrum !== '').map(item => item.valoretemrum);
      }
    })
    this.protocolloCemService.elencorumoreSelectboxValuesProtocolloCem().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.elencorumoreOptions = res.filter(item => item.numcodcar !== '').map(item => item.numcodcar);
      }
    })
    this.protocolloCemService.subassegnazioneSelectboxValuesProtocolloCem().subscribe(res => {
      if (res && Array.isArray(res)) {
        const data = res.filter(item => item.nomeoperatore !== '').map(item => item.nomeoperatore);
        this.subassegnazioneOptions = data
            .filter(item => item !== null)
            .map(item => ({ label: item, value: item }));
      }
    })
    this.protocolloCemService.statoimpiantoSelectboxValuesProtocolloCem().subscribe(res => {
      this.statoimpiantoOptions = res;
    })
    this.protocolloCemService.statoproceduraSelectboxValuesProtocolloCem().subscribe(res => {
      this.statoproceduraOptions = res;
    })
    this.protocolloCemService.numcodsitoSelectboxValuesProtocolloCem().subscribe(res => {
      if (res && Array.isArray(res)) {
        this.numcodsitoOptions = res
            .filter(item => item.numcodsito|| item.gestore)  // Filter out entries with both fields null or empty
            .map(item => ({
              label: `${item.numcodsito || 'null'} / ${item.gestore || 'null'}`,  // Use 'N/A' for display if null
              value: item.numcodsito
            }));
      }
    });
    
    this.protocolloCemService.elencorumoreSelectboxValuesProtocolloCem().subscribe(res => {
      console.log('Elenco rumore data:', res);
      if (res && Array.isArray(res)) {
        this.elencorumoreOptions = res
          .filter(item => item.numcodcar || 'null')  // Assicurati che numcodcar abbia un valore
          .map(item => ({
            label: `${item.numcodcar || 'null'}`,  // Usa 'null' se numcodcar è vuoto
            value: item.numcodcar || 'null'
          }));
      }
    });    
    
    this.protocolloCemService.elencoufficioSelectboxValuesProtocolloCem().subscribe(res => {
      console.log('Elenco ufficio data:', res);
      if (res && Array.isArray(res)) {
        this.elencoufficioOptions = res
          .filter(item => item.numcodprog || 'null')  // Assicurati che numcodprog abbia un valore
          .map(item => ({
            label: `${item.numcodprog || 'null'}`,  // Usa 'null' se numcodprog è vuoto
            value: item.numcodprog || 'null'
          }));
      }
    });       
  }

  parseDataFields(value: any): any {
    return value;
  }
  parseFields(data: any): string[] {
    if (!data) return []; // Handle case where data is null or undefined

    // Remove brackets [] and split by comma
    const numbersAsString = data.replace('[', '').replace(']', '').split(',');

    // Trim whitespace and return as string array
    return numbersAsString.map(num => num.trim());
  }
  parseDataFieldsNumcodcar(numcodcar: string): string[] {
    try {
      // Assuming numcodcar is a JSON string array, like '["1001 -RUM-AIA","dskls"]'
      return JSON.parse(numcodcar);
    } catch (error) {
      console.error('Error parsing numcodcar:', error);
      return []; // Return an empty array if parsing fails
    }
  }
  ngOnInit() {

    this.protocolloCemService.getProtocolloCemData().subscribe(data => {
      this.datas = data.map(item => ({
        ...item,
        formattedData: this.formatDate(item.data) // Add formatted date property
      })).sort((a, b) => {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        return dateB.getTime() - dateA.getTime(); // Sort in descending order
      });
    });
    this.initializeForm();

    this.dataForm.get('tematica')?.valueChanges.subscribe(value => {
      let serviceCall;
      let serviceCallForSotCat;
      if (['CEM'].includes(value)) {
        serviceCall = this.protocolloCemService.categoriaSelectboxValuesProtocolloCem();
        this.dataForm.get('categoria')?.valueChanges.subscribe(res => {

          if (['SRB', 'RADIO', 'TV'].includes(res) && this.dataForm.get('tematica').value == 'CEM') {
             this.protocolloCemService.sottcatcemSelectboxValuesProtocolloCem().subscribe(res => {
                   this.sottocategoriaOptions = res;
                   this.resetOtherOptions(1);
             });
          } else if (['OSSERVATORIO', 'ESPOSTO', 'Accesso agli Atti'].includes(res) && this.dataForm.get('tematica').value == 'CEM') {
            this.protocolloCemService.sottcatcem1SelectboxValuesProtocolloCem().subscribe( res => {
              this.sottocategoriaOptions1 = res;
              this.resetOtherOptions(2);
            });
          } else if (['PROGETTO', 'CONVENZIONE'].includes(res) && this.dataForm.get('tematica').value == 'CEM') {
            this.protocolloCemService.sottcatcem2SelectboxValuesProtocolloCem().subscribe(res  => {
              this.sottocategoriaOptions2 = res;
              this.resetOtherOptions(3);
            });
          } else if (['TAVOLO TECNICO', 'SNPA', 'CATASTO', 'ALTRO'].includes(res) && this.dataForm.get('tematica').value == 'CEM') {
            this.protocolloCemService.sottcatcem3SelectboxValuesProtocolloCem().subscribe(res  => {
              this.sottocategoriaOptions3 = res;
              this.resetOtherOptions(4);
            });
          } else if (res === 'ELF' && this.dataForm.get('tematica').value == 'CEM') {
            this.protocolloCemService.sottcatcem4SelectboxValuesProtocolloCem().subscribe(res  => {
              this.sottocategoriaOptions4 = res;
              this.resetOtherOptions(5);
            });
          }

        });
        this.dataForm.get('numcodsito').enable();
        this.dataForm.get('statoimpianto').enable();
        this.dataForm.get('statoprocedura').enable();
        this.dataForm.get('notadigos').enable();
        this.dataForm.get('congiunta').enable();
        this.dataForm.get('numcodcar').disable();
        this.dataForm.get('numcodcar').setValue('');
        this.dataForm.get('numcodprog').disable();
        this.dataForm.get('numcodprog').setValue('');
        this.dataForm.get('dpia').disable();
        this.dataForm.get('dpia').setValue('');
      } else if (['RUMORE', 'RUMORE CEM'].includes(value)) {
        serviceCall = this.protocolloCemService.catRumSelectboxValuesProtocolloCem();
        this.protocolloCemService.sottcatRumSelectboxValuesProtocolloCem().subscribe(res  => {
          this.sottocategoriaOptionsRum = res;
          this.resetOtherOptions(6);
        });
        this.dataForm.get('numcodcar').enable();
        this.dataForm.get('dpia').enable();
        this.dataForm.get('numcodsito').disable();
        this.dataForm.get('numcodsito').setValue('');
        this.dataForm.get('statoimpianto').disable();
        this.dataForm.get('statoimpianto').setValue('');
        this.dataForm.get('statoprocedura').disable();
        this.dataForm.get('statoprocedura').setValue('');
        this.dataForm.get('notadigos').disable();
        this.dataForm.get('notadigos').setValue('');
        this.dataForm.get('congiunta').disable();
        this.dataForm.get('congiunta').setValue('');
        this.dataForm.get('numcodprog').disable();
        this.dataForm.get('numcodprog').setValue('');
      } else if (['UFFICIO'].includes(value)) {
        serviceCall = this.protocolloCemService.catUffSelectboxValuesProtocolloCem();
        this.protocolloCemService.sottcatUffSelectboxValuesProtocolloCem().subscribe(res  => {
          this.sottocategoriaOptionsUff = res;
          this.resetOtherOptions(7);
        });
        this.dataForm.get('numcodprog').enable();
        this.dataForm.get('numcodsito').disable();
        this.dataForm.get('numcodsito').setValue('');
        this.dataForm.get('statoimpianto').disable();
        this.dataForm.get('statoimpianto').setValue('');
        this.dataForm.get('statoprocedura').disable();
        this.dataForm.get('statoprocedura').setValue('');
        this.dataForm.get('notadigos').disable();
        this.dataForm.get('notadigos').setValue('');
        this.dataForm.get('congiunta').disable();
        this.dataForm.get('congiunta').setValue('');
        this.dataForm.get('numcodcar').disable();
        this.dataForm.get('numcodcar').setValue('');
        this.dataForm.get('dpia').disable();
        this.dataForm.get('dpia').setValue('');
      } else{
        serviceCall = ''
        this.dataForm.get('numcodcar').disable();
        this.dataForm.get('numcodcar').setValue('');
        this.dataForm.get('numcodprog').disable();
        this.dataForm.get('numcodprog').setValue('');
        this.dataForm.get('numcodsito').disable();
        this.dataForm.get('numcodsito').setValue('');
        this.dataForm.get('congiunta').disable();
        this.dataForm.get('congiunta').setValue('');
        this.dataForm.get('notadigos').disable();
        this.dataForm.get('notadigos').setValue('');
        this.dataForm.get('statoprocedura').disable();
        this.dataForm.get('statoprocedura').setValue('');
        this.dataForm.get('statoimpianto').disable();
        this.dataForm.get('statoimpianto').setValue('');
        this.dataForm.get('dpia').disable();
        this.dataForm.get('dpia').setValue('');
      }

      if (serviceCall) {
        serviceCall.subscribe(res => {
          this.categoriaOptions = res;
          // this.dataForm.get('categoria').setValue('');
          // this.dataForm.get('sottocategoria').setValue('');
        });
      }else{
        this.categoriaOptions = []
      }
    });


    this.dataForm.get('protcollegato').valueChanges.subscribe(value => {
      if (value === 'SI') {
        this.dataForm.get('numprotcoll').enable();
      } else {
        this.dataForm.get('numprotcoll').disable();
        this.dataForm.get('numprotcoll').setValue('');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  resetOtherOptions(activeIndex: number) {
    this.sottocategoriaOptions = activeIndex === 1 ? this.sottocategoriaOptions : [];
    this.sottocategoriaOptions1 = activeIndex === 2 ? this.sottocategoriaOptions1 : [];
    this.sottocategoriaOptions2 = activeIndex === 3 ? this.sottocategoriaOptions2 : [];
    this.sottocategoriaOptions3 = activeIndex === 4 ? this.sottocategoriaOptions3 : [];
    this.sottocategoriaOptions4 = activeIndex === 5 ? this.sottocategoriaOptions4 : [];
    this.sottocategoriaOptionsRum = activeIndex === 6 ? this.sottocategoriaOptionsRum : [];
    this.sottocategoriaOptionsUff = activeIndex === 7 ? this.sottocategoriaOptionsUff : [];
  }

  isTematicaNonCompetenzaOrEmpty(): boolean {
    const tematicaValue = this.dataForm.get('tematica')?.value;
    return tematicaValue === 'NON DI COMPETENZA' || tematicaValue === ''
  }

  shouldShowDropdown(tematica: string, ...categories: string[]): boolean {
    const tematicaValue = this.dataForm.get('tematica')?.value;
    const categoriaValue = this.dataForm.get('categoria')?.value;
    return tematicaValue === tematica && categories.includes(categoriaValue);
  }
  shouldShowEmptyCategorie(tematica: string): boolean {
    const tematicaValue = this.dataForm.get('tematica')?.value;
    const categoriaValue = this.dataForm.get('categoria')?.value;
    return tematicaValue === tematica && categoriaValue == '' ;
  }
  getCodiceSitoGestoriForClickedPopup(siteCode: any): void {
    this.protocolloCemService.getCodiceSitoGestoriForClickedPopup(siteCode).subscribe((data: any) => {
      console.log(data);
        this.showCodiceSitoPopupData(data[0]);
    }, error => {
      console.error('Error fetching data:', error);
      // Handle error as needed
    });
  }

  getElencoUffForClickedPopup(numcodprog: string): void {

    this.protocolloCemService.getElencoUffForClickedPopup(numcodprog).subscribe((data: any) => {
      console.log(data);
        this.showElencoUffPopupData(data[0]);
    }, error => {
      console.error('Error fetching data:', error);
      // Handle error as needed
    });
  }

  getElencoRumoreForClickedPopup(numcodcar: string): void {

    this.protocolloCemService.getElencoRumoreForClickedPopup(numcodcar).subscribe((data: any) => {
      console.log(data);
        this.showElencoRumorePopupData(data[0]);
    }, error => {
      console.error('Error fetching data:', error);
      // Handle error as needed
    });
  }

  getProtocolloForClickedPopup(protocol: any){
    this.protocolloCemService.getProtocolloForClickedPopup(protocol).subscribe((data: any) => {
        this.showProtocolAndProtrferimePopupData(data[0]);
    }, error => {
      console.error('Error fetching data:', error);
      // Handle error as needed
    });
  }
  initializeForm(): void {
    this.dataForm = this.fb.group({
      idprot: [''],
      senso: [''],
      data: [''],
      protocollo: ['', Validators.required],
      autore: [''],
      mittente: [''],
      destinatario: [''],
      oggetto: [''],
      protcollegato: [''],
      numprotcoll: [{ value: '', disabled: true }],
      riscontrogeos: [''],
      subassegnazione: [''],
      note: [''],
      tematica: [''],
      categoria: [''],
      sottocategoria: [''],
      azione: [''],
      azionedup: [''],
      protriferime:[''],
      aie: [''],
      dpia: [{ value: '', disabled: true }],
      congiunta: [{ value: '', disabled: true }],
      simulazione: [''],
      numcodsito: [{ value: '', disabled: true }],
      numcodcar: [{ value: '', disabled: true }],
      numcodprog: [{ value: '', disabled: true }],
      statoimpianto: [{ value: '', disabled: true }],
      statoprocedura: [{ value: '', disabled: true }],
      scadenza: [''],
      scadenza2: [''],
      cdsdata: [''],
      cdsora: [''],
      noteazione: [''],
      notadigos: [{ value: '', disabled: true }],
      dirigente:[''],
      funzionario:[''],
      commriscontro:[''],
    });
  }

  dataPatch(): void{
    this.dataForm.patchValue({
      id: this.data?.idprot || '',
      senso: this.data?.senso || '',
      data: this.data?.data || '',
      protocollo: this.data?.protocollo || '',
      autore: this.data?.autore || '',
      mittente: this.data?.mittente || '',
      destinatario: this.data?.destinatario || '',
      oggetto: this.data?.oggetto || '',
      protcollegato: this.data?.protcollegato || '',
      numprotcoll: this.data?.numprotcoll || '',
      riscontrogeos: this.data?.riscontrogeos || '',
      subassegnazione: this.data?.subassegnazione || '',
      note: this.data?.note || '',
      tematica: this.data?.tematica || '',
      categoria: this.data?.categoria || '',
      sottocategoria: this.data?.sottocategoria || '',
      azione: this.data?.azione || '',
      azionedup: this.data?.azionedup || '',
      protriferime: this.data?.protriferime || '',
      aie: this.data?.aie || '',
      dpia: this.data?.dpia || '',
      congiunta: this.data?.congiunta || '',
      simulazione: this.data?.simulazione || '',
      numcodsito: this.data?.numcodsito || '',
      numcodcar: this.data?.numcodcar || '',
      numcodprog: this.data?.numcodprog || '',
      statoimpianto: this.data?.statoimpianto || '',
      statoprocedura: this.data?.statoprocedura || '',
      scadenza: this.data?.scadenza || '',
      scadenza2: this.data?.scadenza2 || '',
      cdsdata: this.data?.cdsdata || '',
      cdsora: this.data?.cdsora || '',
      noteazione: this.data?.noteazione || '',
      notadigos: this.data?.notadigos || '',
      dirigente: this.data?.dirigente || '',
      funzionario: this.data?.funzionario || '',
      commriscontro: this.data?.commriscontro || ''
    });
  }

  dataExpansionPatch(): void{
    this.data.protcollegato = this.dataForm.get('protcollegato').value ? this.dataForm.get('protcollegato').value : this.data?.protcollegato;
    this.data.numprotcoll = this.dataForm.get('numprotcoll').value ? this.dataForm.get('numprotcoll').value : this.data?.numprotcoll;
    this.data.azione = this.dataForm.get('azione').value ? this.dataForm.get('azione').value : this.data?.azione;
    this.data.azionedup = this.dataForm.get('azionedup').value ? this.dataForm.get('azionedup').value : this.data?.azionedup;
    this.data.protriferime = this.dataForm.get('protriferime').value ? this.dataForm.get('protriferime').value : this.data?.protriferime;
    this.data.numcodsito = this.dataForm.get('numcodsito').value ? this.dataForm.get('numcodsito').value : this.data?.numcodsito;
  }

  openNewData() {
    this.data = {};
    this.dataPatch();
    this.submittedData = false;
    this.newDialog = true;
    this.isDataReadonly = false;
  }

  editData(data: ProtocolloCemDto) {
    this.data = {...data};
    this.dataDialog = true;
    this.selectedIdProt = data.idprot;
    this.isDataReadonly = false;
    this.dataPatch();

    const dataValue = this.dataForm.get('data').value;
    const formattedDate = dataValue ? new Date(dataValue) : null;

    this.dataForm.controls['data'].setValue(formattedDate);

    const scadenzaValue = this.dataForm.get('scadenza').value;
    const formattedScadenza = scadenzaValue ? new Date(scadenzaValue) : null;
    this.dataForm.controls['scadenza'].setValue(formattedScadenza);

    const scadenza2Value = this.dataForm.get('scadenza2').value;
    const formattedScadenza2 = scadenza2Value ? new Date(scadenza2Value) : null;
    this.dataForm.controls['scadenza2'].setValue(formattedScadenza2);

    const cdsdataValue = this.dataForm.get('cdsdata').value;
    const formattedCdsdata = cdsdataValue ? new Date(cdsdataValue) : null;
    this.dataForm.controls['cdsdata'].setValue(formattedCdsdata);
  }


  showData(data: ProtocolloCemDto) {
    this.data = {...data};
    this.selectedData = this.data;
    this.dataShowDialog = true;
    this.isDataReadonly =  true;
    this.dataPatch();
  }


  showCodiceSitoPopupData(data: CodiceSitoGestoriPopUpDto): void {
    this.selectedCodiceSitoPopupData = data;
    this.dataCodiceSitoPopupDialog = true;
    this.isDataReadonly = true;
  }
  showElencoUffPopupData(data: ElencoRumoreDto): void {
    this.selectedElencoUffPopupData = data;
    this.dataElencoUffPopupDialog = true;
    this.isDataReadonly = true;
  }
  showElencoRumorePopupData(data: ElencoRumoreDto): void {
    this.selectedElencoRumorePopupData = data;
    this.dataElencoRumorePopupDialog = true;
    this.isDataReadonly = true;
  }
  showProtocolAndProtrferimePopupData(data: ProtocolloCemDto){
    this.selectedProtocolandProtriferimePopupData = data;
    this.dataProtocolandProtriferimePopupDialog = true;
    this.isDataReadonly =  true;
  }
  hideElencoUffPopupDataDialog() {
    this.dataElencoUffPopupDialog = false;
  }
  hideElencoRumorePopupDataDialog() {
    this.dataElencoRumorePopupDialog = false;
  }
  hideCodiceSitoPopupDataDialog() {
    this.dataCodiceSitoPopupDialog = false;
  }
  hideProtocolAndProtrferimePopupDataDialog() {
    this.dataProtocolandProtriferimePopupDialog = false;
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
  maximizeDialog() {
    this.isMaximized = !this.isMaximized;
    const dialogElement = document.querySelector('.p-dialog');
    if (this.isMaximized) {
      dialogElement.classList.add('p-dialog-maximized');
    } else {
      dialogElement.classList.remove('p-dialog-maximized');
    }
  }

  deleteData(data: ProtocolloCemDto) {
    if (data.idprot) {
      this.confirmationService.confirm({
        message: 'Sei sicuro di voler eliminare i dati?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.protocolloCemService.deleteSelectedDataProtocolloCem(data.idprot).subscribe(
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
              }
          );
        }
      });
    } else {
      console.log('seleziona una riga da eliminare');
    }
  }


  showDeletionConfirmation() {
    this.confirmationService.confirm({
      message: 'Protocollo eliminato',
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
      message: 'Protocolli eliminati',
      header: 'Info',
      acceptLabel: 'Ok',
      rejectVisible: false,
      accept: () => {
        window.location.reload();
      },
    });
  }
  deleteSelectedDatas() {
    if (this.selectedDatas.length == 1) {
      const idprot = this.selectedDatas[0].idprot;
      if(idprot){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.protocolloCemService.deleteSelectedDataProtocolloCem(idprot).subscribe((res) => {
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
      const idprots = this.selectedDatas.map(data => data.idprot);
      if(idprots.length > 1){
        this.confirmationService.confirm({
          message: 'Sei sicuro di voler eliminare i dati?',
          header: 'Conferma',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.protocolloCemService.deletemultipleSelectedDatasProtocolloCem(idprots).subscribe((res) => {
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

  saveData(){
    const dtoOut = new ProtocolloCemDto();
    dtoOut.senso = this.dataForm.get('senso').value;
    const dateValue = this.dataForm.get('data').value;
    if (dateValue == '' || dateValue == null) {
      dtoOut.data = null;
    } else if (dateValue instanceof Date) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();

      dtoOut.data = `${year}-${month}-${day}`;
    }

    dtoOut.protocollo = this.dataForm.get('protocollo').value;
    dtoOut.autore = this.dataForm.get('autore').value;
    dtoOut.mittente = this.dataForm.get('mittente').value;
    dtoOut.destinatario = this.dataForm.get('destinatario').value;
    dtoOut.oggetto = this.dataForm.get('oggetto').value;
    dtoOut.protcollegato = this.dataForm.get('protcollegato').value;
    dtoOut.numprotcoll = this.dataForm.get('numprotcoll').value;
    dtoOut.riscontrogeos = this.dataForm.get('riscontrogeos').value;
    dtoOut.subassegnazione = this.dataForm.get('subassegnazione').value;
    dtoOut.note = this.dataForm.get('note').value;
    dtoOut.tematica = this.dataForm.get('tematica').value;
    dtoOut.categoria = this.dataForm.get('categoria').value;
    dtoOut.sottocategoria = this.dataForm.get('sottocategoria').value;
    dtoOut.azione = this.dataForm.get('azione').value;
    dtoOut.azionedup = this.dataForm.get('azionedup').value;
    dtoOut.protriferime = this.dataForm.get('protriferime').value;
    dtoOut.aie = this.dataForm.get('aie').value;
    dtoOut.dpia = this.dataForm.get('dpia').value;
    dtoOut.congiunta = this.dataForm.get('congiunta').value;
    dtoOut.simulazione = this.dataForm.get('simulazione').value;
    dtoOut.numcodsito = this.dataForm.get('numcodsito').value;
    dtoOut.numcodcar = this.dataForm.get('numcodcar').value;
    dtoOut.numcodprog = this.dataForm.get('numcodprog').value;
    dtoOut.statoimpianto = this.dataForm.get('statoimpianto').value;
    dtoOut.statoprocedura = this.dataForm.get('statoprocedura').value;

    const dateValueScadenza = this.dataForm.get('scadenza').value;
    if (dateValueScadenza == '' || dateValueScadenza == null) {
      dtoOut.scadenza = null;
    } else if (dateValueScadenza instanceof Date) {
      const day = String(dateValueScadenza.getDate()).padStart(2, '0');
      const month = String(dateValueScadenza.getMonth() + 1).padStart(2, '0');
      const year = dateValueScadenza.getFullYear();

      dtoOut.scadenza = `${year}-${month}-${day}`;
    }

    const dateValueScadenza2 = this.dataForm.get('scadenza2').value;
    if (dateValueScadenza2 == '' || dateValueScadenza2 == null) {
      dtoOut.scadenza2 = null;
    } else if (dateValueScadenza2 instanceof Date) {
      const day = String(dateValueScadenza2.getDate()).padStart(2, '0');
      const month = String(dateValueScadenza2.getMonth() + 1).padStart(2, '0');
      const year = dateValueScadenza2.getFullYear();

      dtoOut.scadenza2 = `${year}-${month}-${day}`;
    }

    const dateValueCdsdata = this.dataForm.get('cdsdata').value;
    if (dateValueCdsdata == '' || dateValueCdsdata == null) {
      dtoOut.cdsdata = null;
    } else if (dateValueCdsdata instanceof Date) {
      const day = String(dateValueCdsdata.getDate()).padStart(2, '0');
      const month = String(dateValueCdsdata.getMonth() + 1).padStart(2, '0');
      const year = dateValueCdsdata.getFullYear();

      dtoOut.cdsdata = `${year}-${month}-${day}`;
    }

    dtoOut.cdsora = this.dataForm.get('cdsora').value;
    dtoOut.noteazione = this.dataForm.get('noteazione').value;
    dtoOut.notadigos = this.dataForm.get('notadigos').value;
    dtoOut.dirigente = this.dataForm.get('dirigente').value;
    dtoOut.funzionario = this.dataForm.get('funzionario').value;
    dtoOut.commriscontro = this.dataForm.get('commriscontro').value;
    if(dtoOut.protocollo){
      if(this.newDialog == true){
        this.protocolloCemService.postSaveNewProtocolloCemData(dtoOut).subscribe((res) => {
          if(res){
            this.hideDataDialog();
            this.confirmationService.confirm({
              message: 'Protocollo inserito correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.protocolloCemService.getProtocolloCemData().subscribe(data => {
                  this.datas = data.map(item => ({
                    ...item,
                    formattedData: this.formatDate(item.data) // Add formatted date property
                  })).sort((a, b) => {
                    const dateA = new Date(a.data);
                    const dateB = new Date(b.data);
                    return dateB.getTime() - dateA.getTime(); // Sort in descending order
                  });
                });
              }
            });
          }else{
            console.log('there is an error while posting')
          }
        },
            (error) => {
              this.newDialog = false;
              this.dataDialog = false;
              this.dialogService.openError(error.error.error?.sqlMessage)
            })
      }else if(this.dataDialog== true){
        this.protocolloCemService.putUpdatedOneDataProtocolloCem(this.selectedIdProt, dtoOut).subscribe((res) => {
          if(res){
            this.hideDataDialog();
            this.confirmationService.confirm({
              message: 'Protocollo modificato correttamente',
              header: 'Info',
              acceptLabel: 'Ok',
              rejectVisible: false,
              accept: () => {
                this.protocolloCemService.getProtocolloCemData().subscribe(data => {
                  this.datas = data.map(item => ({
                    ...item,
                    formattedData: this.formatDate(item.data) // Add formatted date property
                  })).sort((a, b) => {
                    const dateA = new Date(a.data);
                    const dateB = new Date(b.data);
                    return dateB.getTime() - dateA.getTime(); // Sort in descending order
                  });
                });
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
      console.log('pls enter protocollo values')
    }

  }

  escapeString(value: string): string {
    return value.replace(/'/g, "''");
  }

  onHideDialog() {
    // Custom logic when the dialog is closed
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
    console.log(selectedData)
    // Convert filtered data to Excel format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save as Excel file
    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneData() {
    const selectedData = this.datas.filter(data => this.selectedData.idprot  == data.idprot );
    console.log(selectedData)
    // Convert filtered data to Excel format
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save as Excel file
    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneDataElencoUffPopup(selectedData: ElencoUfficioDto): void {
    const data: ElencoUfficioDto[] = [selectedData];
    console.log(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneDataElencoRumorePopup(selectedData: ElencoRumoreDto): void {
    const data: ElencoRumoreDto[] = [selectedData];
    console.log(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneDataCodiceSitoPopup(selectedData: CodiceSitoGestoriPopUpDto): void {
    const data: CodiceSitoGestoriPopUpDto[] = [selectedData];
    console.log(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  selectedExportExcelForOneDataProtocolAndProtriferimePopup(selectedData: ProtocolloCemDto): void {
    const data: ProtocolloCemDto[] = [selectedData];
    console.log(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, 'selected_rows.xlsx');
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  }

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

  downloadNumeroProtocolloFile(numeroprotocollo: any) {
    this.esportaDocumentiService.downloadNumeroProtocolloFile(numeroprotocollo).subscribe(res => {
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
