import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals,} from '@po-ui/ng-components';
import { ServerTotvsService } from '../services/server-totvs.service';
import { ExcelService } from '../services/excel-service.service';
import { escape } from 'querystring';


@Component({
  selector: 'app-lista-itens',
  standalone: true,
  imports: [
    CommonModule,
    
    ReactiveFormsModule,
    FormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,
    PoFieldModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule,
  ],
  templateUrl: './lista-itens.component.html',
  styleUrl: './lista-itens.component.css'
})
export class ListaItensComponent {
  
  private srvTotvs = inject(ServerTotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvExcel = inject(ExcelService);
  private srvDialog = inject(PoDialogService);
  private router = inject(Router)
  private formListaItens = inject(FormBuilder);
  
  //Variaveis
  labelLoadTela:string = ''
  loadTela: boolean = false
  loadExcel:boolean = false
  alturaGrid:number=window.innerHeight - 295
  lBotao:boolean = false
  pesquisa!:string

  //---Grid
  colunas!: PoTableColumn[]
  lista!: any[]
   customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados'
  };

  //Formulario
  public form = this.formListaItens.group({
    itCodigoini: [''],
    itCodigofim: [''],
    //tpBusca: [1, Validators.required],
  });

  ChamaImport (){

    this.router.navigate(['list'])

  }

  ChamaObterDados(){
    this.labelLoadTela = "Carregando Dados..."
    this.loadTela = true;
    this.desabilitaForm()
    let paramsTela: any = { items: this.form.value }
    
    this.lista = []   
    
    //Chamar o servico
    this.srvTotvs.ObterDados(paramsTela).subscribe({
      next: (response: any) => {
        
        this.srvNotification.success('Dados listados com sucesso !')
        this.lista = response.items
        this.loadTela = false
        this.lista.sort(this.srvTotvs.ordenarCampos(['iLinha']))
        
        this.habilitaForm()
       
      },
      error: (e) => {
        this.srvNotification.error('Ocorreu um erro ObterDados: ' + e)
        this.loadTela = false
        this.habilitaForm()
      },
    })
  }

  public habilitaForm(){    
    this.lBotao = false
    this.form.controls['itCodigofim'].enable()
    this.form.controls['itCodigoini'].enable()
  }

  public desabilitaForm(){
    this.lBotao = true    
    this.form.controls['itCodigofim'].disable()
    this.form.controls['itCodigoini'].disable()
  }

  public onExportarExcel(){
    let titulo = "CONSULTA DE DADOS DO ITEM " //this.tituloTela.split(':')[0]
    let subTitulo = "DADOS DO ITEM" //this.tituloTela.split(':')[1]
    this.loadExcel = true

    let valorForm: any = { valorForm: this.form.value }
    
    this.srvExcel.exportarParaExcel('CONSULTA DE DADOS: ' + titulo.toUpperCase(),
                                    subTitulo.toUpperCase(),
                                    this.colunas,
                                    this.lista,
                                    'Lista_Itens',
                                    'Plan1')
     
    this.loadExcel = false;
  }

  ngOnInit(): void{

    this.form.controls['itCodigofim'].setValue("ZZZZZZZZZZZZZZZZ")
    this.colunas = this.srvTotvs.obterColunas()

  }

}

