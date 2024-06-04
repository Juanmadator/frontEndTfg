import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';
import { RoutineService } from '../../services/routine/routine.service';
import html2canvas from 'html2canvas';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';

export interface Ejercicio {
  userId: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  repeticiones: number;
  peso: number;
  grupoMuscular: string;
}

export interface Rutina {
  id: number;
  userId: number;
  name: string;
  description: string;
  repeticiones: number;
  peso: number;
  routine: number;
  grupoMuscular: string;
}


@Component({
  selector: 'app-create-rutine',
  standalone: true,
  imports: [NavbarComponent, TranslateModule, CommonModule, FormsModule],
  templateUrl: './create-rutine.component.html',
  styleUrl: './create-rutine.component.css'
})
export class CreateRutineComponent implements OnInit, OnDestroy {
  ejercicios: Ejercicio[] = [];
  imagenSeleccionada!: number;
  repeticiones: number = 10;
  pesoNumero: number = 20;
  rutinas: Rutina[] = [];
  isGeneratingPDF: boolean = false;
  user: any = {};
  username!: string;
  addRoutine() {
    const routineId = this.generateRoutineId();
    this.ejercicios.forEach(exercise => {
      this.routineService.createRoutine(
        exercise.nombre,
        exercise.descripcion,
        exercise.repeticiones,
        exercise.peso,
        routineId,
        exercise.grupoMuscular
      ).subscribe(
        (response: any) => {
          // Puedes realizar alguna acción adicional aquí después de agregar la rutina, si es necesario
          this.translate.get('ADDED_SUCCESSFULLY').subscribe((translatedText: string) => {
            Swal.fire({
              icon: 'success',
              title: '',
              text: translatedText,
              position: 'top',
              showConfirmButton: false,
              timer: 1000, // Tiempo en milisegundos que durará el mensaje
              timerProgressBar: true, // Barra de progreso del temporizador
            }).then(() => {
              // Recargar la página
              setTimeout(() => {
                this.obtenerRutinas();
              },1000)
            });
          });

        },
        (error: any) => {
          console.error('Error adding routine:', error);
          // Maneja el error de acuerdo a tus necesidades
        }
      );
    });
  }

  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
        this.username = this.user.username;
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    );
  }


  obtenerRutinas() {
    this.routineService.getRoutinesByUserId().subscribe((response) => {
      this.rutinas = response;
    })
  }


  generateRoutineId(): string {
    return 'routine-' + Date.now();
  }

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
    "BACK.REMO", "BACK.REMO_UNA_MANO", "BACK.SENTADILLAS", "BACK.CRUNCH_PESO", "BACK.FLEXIONES", "BACK.DOMINADAS"
  ];

  chest: string[] = [
    "CHEST.FLEXIONES", "CHEST.PRESS_BANCA", "CHEST.ELEVACION_MANCUERNAS"
  ];
  legs: string[] = [
    "LEGS.PRESS", "LEGS.ZANCADAS_MANCUERNAS", "LEGS.SENTADILLAS", "LEGS.SALTO_ALTURA", "LEGS.PUNTILLAS"
  ];
  shoulders: string[] = [
    "SHOULDERS.VUELO_CON_ANILLOS", "SHOULDERS.ELEVACION_VERTICAL_MANCUERNAS", "SHOULDERS.ELEVACION_MANCUERNAS_DIRECTA", "SHOULDERS.DOMINADAS", "SHOULDERS.FLEXIONES_INCLINADAS"
  ];
  triceps: string[] = [
    "TRICEPS.FONDO", "TRICEPS.CURL_POLEA", "TRICEPS.ELEVACION_ESPALDA", "TRICEPS.ELEVACION", "TRICEPS.FLEXIONES"
  ];

  biceps_descripcion: string[] = [
    "BICEPS.CURL", "BICEPS.POLEA", "BICEPS.DOMINADAS", "BICEPS.FLEXIONES"
  ];

  abdomen_descripcion: string[] = [
    "ABDOMEN.COLGADO", "ABDOMEN.RUSOS", "ABDOMEN.ELEVACION", "ABDOMEN.SENTADILLAS"
  ];

  back_descripcion: string[] = [
    "BACK.REMO", "BACK.REMO_UNA_MANO", "BACK.SENTADILLAS", "BACK.CRUNCH_PESO", "BACK.FLEXIONES", "BACK.DOMINADAS"
  ];

  chest_descripcion: string[] = [
    "CHEST.FLEXIONES", "CHEST.PRESS_BANCA", "CHEST.ELEVACION_MANCUERNAS"
  ];

  legs_descripcion: string[] = [
    "LEGS.PRESS", "LEGS.ZANCADAS_MANCUERNAS", "LEGS.SENTADILLAS", "LEGS.SALTO_ALTURA", "LEGS.PUNTILLAS"
  ];

  shoulders_descripcion: string[] = [
    "SHOULDERS.VUELO_CON_ANILLOS", "SHOULDERS.ELEVACION_VERTICAL_MANCUERNAS", "SHOULDERS.ELEVACION_MANCUERNAS_DIRECTA", "SHOULDERS.DOMINADAS", "SHOULDERS.FLEXIONES_INCLINADAS"
  ];

  triceps_descripcion: string[] = [
    "TRICEPS.FONDO", "TRICEPS.CURL_POLEA", "TRICEPS.ELEVACION_ESPALDA", "TRICEPS.ELEVACION", "TRICEPS.FLEXIONES"
  ];

  // Mapear nombres de ejercicios a sus respectivas imágenes
  exerciseImageMap: { [key: string]: string } = {
    'BICEPS.CURL': 'assets/images/exercises/biceps/0.png',
    'BICEPS.POLEA': 'assets/images/exercises/biceps/1.png',
    'BICEPS.DOMINADAS': 'assets/images/exercises/back/5.png', // Dominadas se usa para biceps y back
    'BICEPS.FLEXIONES': 'assets/images/exercises/triceps/4.png', // Flexiones se usa para biceps, chest y back
    'ABDOMEN.COLGADO': 'assets/images/exercises/abdomen/0.png',
    'ABDOMEN.RUSOS': 'assets/images/exercises/abdomen/1.png',
    'ABDOMEN.ELEVACION': 'assets/images/exercises/abdomen/2.png',
    'ABDOMEN.SENTADILLAS': 'assets/images/exercises/abdomen/3.png', // Sentadillas con barra se usa para abdomen y back
    'BACK.REMO': 'assets/images/exercises/back/0.png',
    'BACK.REMO_UNA_MANO': 'assets/images/exercises/back/1.png',
    'BACK.SENTADILLAS': 'assets/images/exercises/back/2.png',
    'BACK.CRUNCH_PESO': 'assets/images/exercises/back/3.png',
    'BACK.FLEXIONES': 'assets/images/exercises/back/4.png',
    'BACK.DOMINADAS': 'assets/images/exercises/back/5.png',
    'CHEST.FLEXIONES': 'assets/images/exercises/chest/0.png',
    'CHEST.PRESS_BANCA': 'assets/images/exercises/chest/1.png',
    'CHEST.ELEVACION_MANCUERNAS': 'assets/images/exercises/chest/2.png',
    'LEGS.PRESS': 'assets/images/exercises/legs/0.png',
    'LEGS.ZANCADAS_MANCUERNAS': 'assets/images/exercises/legs/1.png',
    'LEGS.SENTADILLAS': 'assets/images/exercises/legs/2.png',
    'LEGS.SALTO_ALTURA': 'assets/images/exercises/legs/3.png',
    'LEGS.PUNTILLAS': 'assets/images/exercises/legs/4.png',
    'SHOULDERS.VUELO_CON_ANILLOS': 'assets/images/exercises/shoulders/0.png',
    'SHOULDERS.ELEVACION_VERTICAL_MANCUERNAS': 'assets/images/exercises/shoulders/1.png',
    'SHOULDERS.ELEVACION_MANCUERNAS_DIRECTA': 'assets/images/exercises/shoulders/2.png',
    'SHOULDERS.DOMINADAS': 'assets/images/exercises/shoulders/3.png',
    'SHOULDERS.FLEXIONES_INCLINADAS': 'assets/images/exercises/shoulders/4.png',
    'TRICEPS.FONDO': 'assets/images/exercises/triceps/0.png',
    'TRICEPS.CURL_POLEA': 'assets/images/exercises/triceps/1.png',
    'TRICEPS.ELEVACION_ESPALDA': 'assets/images/exercises/triceps/2.png',
    'TRICEPS.ELEVACION': 'assets/images/exercises/triceps/3.png',
    'TRICEPS.FLEXIONES': 'assets/images/exercises/triceps/4.png',
   'BICICLETA':'assets/images/4.png',
    'CORRER':'assets/images/7.png',
    'ANDAR':'assets/images/10.png'
  };

  currentPage: number = 1;
  selectedHour: number | null = null;
  selectedMinutes: number | null = null;
  nombresImagenesTraducidas: string[] = [];
  selectedIntensity = '';
  personalNotes = '';
  ejercicio: number = -1;
  private langChangeSubscription!: Subscription;
  constructor(private translate: TranslateService, private userService: UserService, private el: ElementRef, private routineService: RoutineService) {
  }

  scrollToLista() {
    const listaElement = this.el.nativeElement.querySelector('#lista');
    if (listaElement) {
      listaElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  ngOnInit(): void {
    this.updateTranslations();
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
    this.getUserData();
    this.obtenerRutinas();
  }

  deleteExercise(index: number) {
    this.ejercicios.splice(index, 1); // Eliminar el ejercicio en la posición index del array
  }

  save() {

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
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, generate it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.isGeneratingPDF = true;

        setTimeout(() => {
          const content = document.getElementById('pdfContent');

          if (content) {
            html2canvas(content, {
              scale: 2, // Increase scale for better resolution
              useCORS: true, // Enable cross-origin resource sharing
              logging: true // Enable logging for debugging
            }).then(canvas => {
              const imgData = canvas.toDataURL('image/png');
              const doc = new jsPDF('portrait', 'mm', 'a4');
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
              const margin = 10;
              const imgWidth = pageWidth - 2 * margin;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              let heightLeft = imgHeight;
              let position = 20; // Start position below the header

              // Function to add header and footer
              const addHeaderFooter = (doc, pageNumber) => {
                const totalPages = doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                doc.text('FIT-TRACK', margin, 10); // Header text
                doc.text(`Page ${pageNumber} of ${totalPages}`, margin, pageHeight - 10); // Footer text
              };

              let pageNumber = 1;

              // Add the first page
              doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
              addHeaderFooter(doc, pageNumber);
              heightLeft -= pageHeight - position - 20; // Adjust for header and footer height

              // Add extra pages if the content is taller than a single page
              while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                pageNumber++;
                doc.addImage(imgData, 'PNG', margin, 20, imgWidth, imgHeight); // Leave space for header and footer
                addHeaderFooter(doc, pageNumber);
                heightLeft -= pageHeight - 20; // Adjust for header and footer height
              }

              const fileName = `rutina_${this.getFormattedDate()}.pdf`;
              doc.save(fileName);
              this.isGeneratingPDF = false;
            }).catch(error => {
              console.error('Error generating canvas:', error);
              this.isGeneratingPDF = false;
            });
          } else {
            console.error('Element not found: pdfContent');
            this.isGeneratingPDF = false;
          }
        }, 500); // A slight delay to ensure content is fully rendered
      }
    });
  }


  getFormattedDate() {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }


  verificarEjercicio(): void {
    if (this.currentPage === 3 && this.ejercicio < 0) {
      // Solo mostrar el SweetAlert si la imagen seleccionada no es 3, 6 o 9
      if (this.imagenSeleccionada !== 3 && this.imagenSeleccionada !== 6 && this.imagenSeleccionada !== 9) {
        this.mostrarAlertaSeleccionarEjercicio();
        this.currentPage--; // Retrocede si no se ha seleccionado un ejercicio válido
      }
    }
  }

  mostrarAlertaSeleccionarEjercicio(): void {
    this.translate.get('SELECT_EJERCICIO').subscribe((translation: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "error",
        title: translation
      });
    });
  }

  nextStep() {

    if (this.currentPage < 3) {
      if (this.currentPage === 2 && (this.imagenSeleccionada === 3 || this.imagenSeleccionada === 6 || this.imagenSeleccionada === 9)) {
        this.currentPage++;
      } else {
        this.currentPage++;
      }
    }
    this.verificarEjercicio();
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


  private updateTranslations() {
    this.translate.get(this.nombresImagenes).subscribe(translations => {
      this.nombresImagenesTraducidas = this.nombresImagenes.map(key => translations[key]);
    });
  }



  crearRutina(): void {
    this.addExercise();
  }

  seleccionarImagen(index: number) {
    this.imagenSeleccionada = index;
    this.ejercicio = -1;
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

  getImageForExercise(exerciseName: string): string {
    return this.exerciseImageMap[exerciseName] || 'assets/images/default.png'; // Ruta por defecto si no se encuentra el nombre
  }



  getDescripcionEjercicioSeleccionado(): string {
    let descripcion = '';
    switch (this.imagenSeleccionada) {
      case 0:
        descripcion = "ABDOMEN.DESCRIPCION." + this.abdomen[this.ejercicio].split('.')[1];
        break;
      case 1:
        descripcion = "BACK.DESCRIPCION." + this.back[this.ejercicio].split('.')[1];
        break;
      case 2:
        descripcion = "BICEPS.DESCRIPCION." + this.biceps[this.ejercicio].split('.')[1];
        break;
      case 3: // Agregado para bicicleta
        descripcion = "BICICLETA_DES";
        break;
      case 4:
        descripcion = "CHEST.DESCRIPCION." + this.chest[this.ejercicio].split('.')[1];
        break;
      case 5:
        descripcion = "LEGS.DESCRIPCION." + this.legs[this.ejercicio].split('.')[1];
        break;
      case 6: // Agregado para correr
        descripcion = "CORRER_DES";
        break;
      case 7:
        descripcion = "SHOULDERS.DESCRIPCION." + this.shoulders[this.ejercicio].split('.')[1];
        break;
      case 8:
        descripcion = "TRICEPS.DESCRIPCION." + this.triceps[this.ejercicio].split('.')[1];
        break;
      case 9: // Agregado para andar
        descripcion = "ANDAR_DES";
        break;
      default:
        descripcion = '';
        break;
    }
    return descripcion;
  }



  getName(): string {
    let descripcion = '';
    switch (this.imagenSeleccionada) {
      case 0:
        descripcion = this.abdomen[this.ejercicio];
        break;
      case 1:
        descripcion = this.back[this.ejercicio];
        break;
      case 2:
        descripcion = this.biceps[this.ejercicio];
        break;
      case 3: // Agregado para bicicleta
        descripcion = "BICICLETA";
        break;
      case 4:
        descripcion = this.chest[this.ejercicio];
        break;
      case 5:
        descripcion = this.legs[this.ejercicio];
        break;
      case 6: // Agregado para correr
        descripcion = "CORRER";
        break;
      case 7:
        descripcion = this.shoulders[this.ejercicio];
        break;
      case 8:
        descripcion = this.triceps[this.ejercicio];
        break;
      case 9: // Agregado para andar
        descripcion = "ANDAR";
        break;
      default:
        descripcion = '';
        break;
    }
    return descripcion;
  }


  peso: number = 0;


  showPlusSymbols() {
    confetti({
      spread: 360,
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
      particleCount: 100,
      scalar: 3,
      shapes: ["image"],
      shapeOptions: {

      }
    });
  }

  sumarCantidad() {
    this.peso++;
  }


  addExercise() {
    let nuevoEjercicio;

    if (this.imagenSeleccionada != 3 && this.imagenSeleccionada != 6 && this.imagenSeleccionada != 9) {
      nuevoEjercicio = {
        nombre: this.getName(),
        descripcion: this.getDescripcionEjercicioSeleccionado(),
        repeticiones: this.repeticiones,
        peso: this.pesoNumero,
        imagen: this.imagenesEjercicios[this.imagenSeleccionada][this.ejercicio],
        grupoMuscular: this.nombresImagenes[this.imagenSeleccionada],
      };


    } else {
      nuevoEjercicio = {
        nombre: this.getName(),
        descripcion: this.getDescripcionEjercicioSeleccionado(),
        repeticiones: this.repeticiones,
        peso: this.pesoNumero,
        imagen: this.imagenes[this.imagenSeleccionada],
        grupoMuscular: this.nombresImagenes[this.imagenSeleccionada],
      };

    }


    if (this.ejercicios.push(nuevoEjercicio)) {
      this.translate.get('ADDED_SUCCESSFULLY').subscribe((translatedText: string) => {
        Swal.fire({
          icon: 'success',
          title: '',
          text: translatedText,
          position: 'top',
          showConfirmButton: false,
          timer: 1000, // Tiempo en milisegundos que durará el mensaje
          timerProgressBar: true, // Barra de progreso del temporizador
        }).then(() => {
          // Recargar la página
          setTimeout(() => {
            this.obtenerRutinas();
          },1000)
        });
      });



    }

    setTimeout(() => {
      this.currentPage = 1;
      this.ejercicio = -1;
      this.imagenSeleccionada = -1;
    }, 500);

  }


  eliminarRutina(ejercicio: Rutina): void {
    this.routineService.deleteRoutine(ejercicio.id)
      .subscribe(
        (response: string) => {
          this.translate.get('RUTINE_DONE').subscribe((translatedText: string) => {
            Swal.fire({
              icon: 'success',
              title: '',
              text: translatedText,
              position: 'top',
              showConfirmButton: false,
              timer: 1000, // Tiempo en milisegundos que durará el mensaje
              timerProgressBar: true, // Barra de progreso del temporizador
            }).then(() => {
              // Lanzar confeti
              this.lanzarConfeti();
              // Recargar la página
              setTimeout(() => {
                this.obtenerRutinas();
              }, 500);
            });
          });
        },
        (error) => {
          this.translate.get('RUTINE_DONE').subscribe((translatedText: string) => {
            this.lanzarConfeti();
            Swal.fire({
              icon: 'success',
              title: '',
              text: translatedText,
              position: 'top',
              showConfirmButton: false,
              timer: 1000, // Tiempo en milisegundos que durará el mensaje
              timerProgressBar: true, // Barra de progreso del temporizador
            }).then(() => {
              // Lanzar confeti

              // Recargar la página
              setTimeout(() => {
                this.obtenerRutinas();
              }, 500);
            });
          });
        }
      );
  }

  lanzarConfeti(): void {
    var duration = 2 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    var interval: any = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3) } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9) } }));
    }, 250);
  }

}
