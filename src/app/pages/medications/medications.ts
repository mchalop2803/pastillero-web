import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable, firstValueFrom, map } from 'rxjs';

import { FullCalendarModule } from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { DataService } from '../../services/data';
import { StorageService } from '../../services/storage.service';

import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DetailModalComponent,
    FullCalendarModule
  ],
  templateUrl: './medications.html',
  styleUrls: ['./medications.css'],
})
export class Medications {

  medicaments$!: Observable<any[]>;
  filteredMeds$!: Observable<any[]>;

  calendarOptions: any;

  calendarEvents: any[] = [];

  selectedDate: Date | null = null;

  selectedDayMedicaments: any[] = [];

  filter: string = 'TODOS';

  isSaving: boolean = false;

  newMedicament: any = {
    nombre: '',
    dosis: '',
    momentoDia: '',
    horario: '',
    imageUrl: ''
  };

  selectedFile: File | null = null;

  isAddModalOpen = false;

  editingId: string | null = null;

  selectedItem: any = null;

  isDetailOpen = false;

  constructor(
    private data: DataService,
    private storage: StorageService
  ) {}

  ngOnInit() {

    this.medicaments$ = this.data.getMedicaments();

    this.filteredMeds$ = this.medicaments$.pipe(
      map(meds => this.applyFilter(meds))
    );

    this.loadCalendar();
  }

  // ================= FILTRO =================

  setFilter(value: string) {

    this.filter = value;

    this.filteredMeds$ = this.medicaments$.pipe(
      map(meds => this.applyFilter(meds))
    );
  }

  applyFilter(meds: any[]) {

    if (this.filter === 'TODOS')
      return meds;

    return meds.filter(
      m => m.momentoDia === this.filter
    );
  }

  // ================= CALENDARIO =================

  loadCalendar() {

    this.data.getAlerts().subscribe(alerts => {

      const map = new Map<string, any>();

      alerts.forEach(alert => {

        const date = new Date(alert.hora);

        const dayKey =
          `${date.getFullYear()}-${
            date.getMonth()
          }-${date.getDate()}`;

        const uniqueKey =
          `${dayKey}_${alert.medicamentoId}`;

        if (!map.has(uniqueKey)) {

          let color = '#FF9800';

          switch ((alert.estado || 'PENDIENTE').toUpperCase()) {

            case 'TOMADA':
              color = '#4CAF50';
              break;

            case 'PERDIDA':
              color = '#F44336';
              break;
          }

          map.set(uniqueKey, {

            title: alert.nombre,

            start: date,

            color,

            extendedProps: {
              medicamentoId: alert.medicamentoId
            }
          });
        }
      });

      this.calendarEvents =
        Array.from(map.values());

      this.calendarOptions = {

        plugins: [
          dayGridPlugin,
          interactionPlugin
        ],

        initialView: 'dayGridMonth',

        locale: 'es',

        height: 'auto',

        events: this.calendarEvents,

        dateClick: (info: any) => {

          this.loadMedicamentsByDay(info.date);
        }
      };
    });
  }

  loadMedicamentsByDay(date: Date) {

    this.selectedDate = date;

    this.data.getAlerts().subscribe(alerts => {

      const map = new Map<string, any>();

      alerts.forEach(alert => {

        const d = new Date(alert.hora);

        const sameDay =
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear();

        if (!sameDay)
          return;

        const key =
          alert.medicamentoId || alert.nombre;

        if (!map.has(key)) {

          map.set(key, {

            medicamentoId: alert.medicamentoId,

            nombre: alert.nombre,

            imageUrl: alert.medicamentImageUrl,

            dosisBase: alert.dosisBase,

            alerts: []
          });
        }

        map.get(key).alerts.push(alert);
      });

      this.selectedDayMedicaments =
        Array.from(map.values());
    });
  }

  // ================= MODALES =================

  openAddModal() {

    this.isAddModalOpen = true;

    this.editingId = null;

    this.newMedicament = {
      nombre: '',
      dosis: '',
      momentoDia: '',
      horario: '',
      imageUrl: ''
    };

    this.selectedFile = null;
  }

  closeModal() {

    this.isAddModalOpen = false;

    this.editingId = null;

    this.selectedFile = null;
  }

  // ================= CRUD =================

  async addMedicament() {

    if (this.isSaving)
      return;

    this.isSaving = true;

    try {

      const meds =
        await firstValueFrom(this.medicaments$);

      const exists = meds.some(m =>

        m.nombre?.toLowerCase().trim() ===
        this.newMedicament.nombre?.toLowerCase().trim()
      );

      if (exists && !this.editingId) {

        alert('❌ Este medicamento ya existe');

        return;
      }

      let imageUrl = '';

      if (this.selectedFile) {

        imageUrl =
          await this.storage.uploadImage(
            this.selectedFile
          );
      }

      const momentoDia =
        this.calculateMomentoDia(
          this.newMedicament.horario
        );

      const data = {

        nombre:
          this.newMedicament.nombre.trim(),

        dosis:
          this.newMedicament.dosis,

        horario:
          this.newMedicament.horario,

        momentoDia,

        imageUrl
      };

      if (this.editingId) {

        await this.data.updateMedicament(
          this.editingId,
          data
        );

      } else {

        await this.data.addMedicament(data);
      }

      this.closeModal();

    } catch (err) {

      console.error(err);

      alert('Error al guardar');

    } finally {

      this.isSaving = false;
    }
  }

  deleteMedicament(id: string) {

    this.data.deleteMedicament(id);

    this.data.deleteAlertByMedicament(id);
  }

  onFileChange(event: any) {

    this.selectedFile =
      event.target.files[0] || null;
  }

  // ================= DETAIL =================

  openDetail(item: any) {

    this.selectedItem = item;

    this.isDetailOpen = true;
  }

  closeDetail() {

    this.isDetailOpen = false;

    this.selectedItem = null;
  }

  deleteFromModal(item: any) {

    this.deleteMedicament(item.id);

    this.closeDetail();
  }

  editFromModal(item: any) {

    this.editingId = item.id;

    this.newMedicament = { ...item };

    this.closeDetail();

    this.isAddModalOpen = true;
  }

  // ================= UTIL =================

  private calculateMomentoDia(
    horario: string
  ): string {

    if (!horario)
      return '';

    const [h, m] =
      horario.split(':').map(Number);

    const total = h * 60 + m;

    if (total >= 361 && total <= 720)
      return 'MAÑANA';

    if (total >= 721 && total <= 1200)
      return 'TARDE';

    return 'NOCHE';
  }
}
