import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-rutine',
  standalone: true,
  imports: [NavbarComponent, TranslateModule, CommonModule],
  templateUrl: './create-rutine.component.html',
  styleUrl: './create-rutine.component.css'
})
export class CreateRutineComponent implements OnInit, OnDestroy {
  imagenSeleccionada: number | null = null;
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
  currentPage: number = 1;
  selectedHour: number | null = null;
  selectedMinutes: number | null = null;
  nombresImagenesTraducidas: string[] = [];
  private langChangeSubscription!: Subscription;
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');
  }

  ngOnInit(): void {
    this.updateTranslations();
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  nextStep() {
    if (this.currentPage < 3) {
      this.currentPage++;
    }
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

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
  }
}
