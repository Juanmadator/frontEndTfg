import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-create-rutine',
  standalone: true,
  imports: [NavbarComponent, TranslateModule, CommonModule, FormsModule],
  templateUrl: './create-rutine.component.html',
  styleUrl: './create-rutine.component.css'
})
export class CreateRutineComponent implements OnInit, OnDestroy {
  imagenSeleccionada!: number;

  imagenes: string[] = [
    'assets/images/1.png', 'assets/images/2.png', 'assets/images/3.png', 'assets/images/4.png',
    'assets/images/5.png', 'assets/images/6.png', 'assets/images/7.png', 'assets/images/8.png',
    'assets/images/9.png', 'assets/images/10.png'
  ];
  nombresImagenes: string[] = [
    "IMAGES.ABDOMEN", "IMAGES.ESPALDA", "IMAGES.BICEPS", "IMAGES.BICICLETA",
    "IMAGES.PECHO", "IMAGES.PIERNAS", "IMAGES.CORRER", "IMAGES.HOMBROS",
    "IMAGES.TRICEPS", "IMAGES.CAMINAR"
  ];

  biceps: string[] = [
    "BICEPS.CURL", "BICEPS.POLEA", "BICEPS.DOMINADAS", "BICEPS.FLEXIONES"
  ];
  abdomen: string[] = [
    "ABDOMEN.COLGADO", "ABDOMEN.RUSOS", "ABDOMEN.ELEVACION", "ABDOMEN.SENTADILLAS"
  ];
  back: string[] = [
    "BACK.REMO", "BACK.REMO_UNA_MANO", "BACK.SENTADILLAS","BACK.CRUNCH_PESO","BACK.FLEXIONES", "BACK.DOMINADAS"
  ];

  chest: string[] = [
    "CHEST.FLEXIONES","CHEST.PRESS_BANCA","CHEST.ELEVACION_MANCUERNAS"
  ];
  currentPage: number = 1;
  selectedHour: number | null = null;
  selectedMinutes: number | null = null;
  nombresImagenesTraducidas: string[] = [];
  selectedIntensity = '';
  personalNotes = '';
  ejercicio!: number;
  private langChangeSubscription!: Subscription;
  constructor(private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.updateTranslations();
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  selectIntensity(intensity: string): void {
    this.selectedIntensity = intensity;
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  //GUARDAR PDF CON EL EJERCICIO
  generarPDF() {
    const doc = new jsPDF();
    doc.text('Hello world!', 10, 10);
    const fileName = `rutina_${this.getFormattedDate()}.pdf`;
    doc.save(fileName);
  }

  getFormattedDate() {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }


  nextStep() {
    if (this.currentPage < 3) {
      this.currentPage++;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método para retroceder a la página anterior
  stepBefore() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  // En tu archivo de componente TypeScript

  selectHour(hour: number): void {
    this.selectedHour = hour;
  }

  selectMinutes(minutes: number): void {
    this.selectedMinutes = minutes;
  }


  esPaginaActual(pagina: number) {
    return this.currentPage === pagina;
  }



  // Método para crear en el paso 3
  crearEnPaso3() {
    if (this.currentPage === 3) {
      // Aquí puedes agregar la lógica para crear en el paso 3
      console.log('Creando en el paso 3');
    }
  }

  private updateTranslations() {
    this.translate.get(this.nombresImagenes).subscribe(translations => {
      this.nombresImagenesTraducidas = this.nombresImagenes.map(key => translations[key]);
    });
  }



  crearRutina(): void {
    // Lógica para crear la rutina
    console.log('Rutina creada con éxito');
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
    console.log(this.imagenSeleccionada);
  }


  seleccionarEjercicio(index: number) {
    this.ejercicio = index;
  }



  imagenesEjercicios: { [key: number]: string[] } = {
    0: [
      'assets/images/exercises/abdomen/0.png',
      'assets/images/exercises/abdomen/1.png',
      'assets/images/exercises/abdomen/2.png',
      'assets/images/exercises/abdomen/3.png',
    ],
    1: [
      'assets/images/exercises/back/0.png',
      'assets/images/exercises/back/1.png',
      'assets/images/exercises/back/2.png',
      'assets/images/exercises/back/3.png',
      'assets/images/exercises/back/4.png',
      'assets/images/exercises/back/5.png',
    ],
    2: [
      'assets/images/exercises/biceps/0.png',
      'assets/images/exercises/biceps/1.png',
      'assets/images/exercises/biceps/2.png',
      'assets/images/exercises/biceps/3.png'
    ],
    4: [
      'assets/images/exercises/chest/0.png',
      'assets/images/exercises/chest/1.png',
      'assets/images/exercises/chest/2.png',
    ],
    5: [
      'assets/images/exercises/legs/0.png',
      'assets/images/exercises/legs/1.png',
      'assets/images/exercises/legs/2.png',
      'assets/images/exercises/legs/3.png',
      'assets/images/exercises/legs/4.png'
    ],
    7: [
      'assets/images/exercises/shoulders/0.png',
      'assets/images/exercises/shoulders/1.png',
      'assets/images/exercises/shoulders/2.png',
      'assets/images/exercises/shoulders/3.png',
      'assets/images/exercises/shoulders/4.png',
    ],
    8: [
      'assets/images/exercises/triceps/0.png',
      'assets/images/exercises/triceps/1.png',
      'assets/images/exercises/triceps/2.png',
      'assets/images/exercises/triceps/3.png',
      'assets/images/exercises/triceps/4.png'
    ]
  };

}
