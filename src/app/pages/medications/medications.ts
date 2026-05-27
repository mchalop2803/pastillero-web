import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { DataService } from '../../services/data';
import { StorageService } from '../../services/storage.service';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    DetailModalComponent
  ],
  templateUrl: './medications.html',
  styleUrls: ['./medications.css'],
})
export class Medications {

  medicaments$!: Observable<any[]>;
  filteredMeds$!: Observable<any[]>;

  calendarEvents: any[] = [];

  selectedDayMedicaments: any[] = [];

  selectedDate: Date | null = null;

  alertsSub: any;

  alerts: any[] = [];

  calendarOptions: any;

  filter = 'TODOS';

  isSaving = false;

  isAddModalOpen = false;

  editingId: string | null = null;

  selectedItem: any = null;

  isDetailOpen = false;

  selectedFile: File | null = null;

  previewUrl: string | null = null;

  // =========================
  // ALERT MODAL
  // =========================

  isAlertModalOpen = false;

  selectedMedicamentForAlert: any = null;

  newAlert: any = {
    hora: '',
    dosisBase: '',
    frecuencia: 'Cada 24 horas'
  };

  // =========================
  // MEDICAMENTO
  // =========================

  newMedicament: any = {
    nombre: '',
    descripcion: '',
    imageUrl: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor(
    private data: DataService,
    private storage: StorageService
  ) {}

  ngOnInit() {

    this.medicaments$ =
      this.data.getMedicaments();

    this.filteredMeds$ =
      this.medicaments$.pipe(
        map(meds => this.applyFilter(meds))
      );

    this.initCalendar();

    this.loadCalendarEvents();
  }

  ngOnDestroy() {

    if (this.alertsSub) {
      this.alertsSub.unsubscribe();
    }
  }

  // =========================
  // CALENDARIO
  // =========================

  initCalendar() {

    this.calendarOptions = {

      plugins: [
        dayGridPlugin,
        interactionPlugin
      ],

      initialView: 'dayGridMonth',

      locale: esLocale,

      height: 'auto',

      events: this.calendarEvents,

      eventDisplay: 'block',

      dayMaxEvents: true,

      dateClick: (info: any) => {
        this.loadMedicamentsByDay(info.date);
      }
    };
  }

  loadCalendarEvents() {

    if (this.alertsSub) {
      this.alertsSub.unsubscribe();
    }

    this.alertsSub =
      this.data.getAlerts().subscribe(async alerts => {

        this.alerts = alerts;

        const map = new Map();

        const now = Date.now();

        for (const alert of alerts) {

          if (!alert.hora) continue;

          // =========================
          // AUTO UPDATE PERDIDA
          // =========================

          if (
            alert.estado !== 'TOMADA' &&
            alert.estado !== 'PERDIDA' &&
            alert.hora < now
          ) {

            alert.estado = 'PERDIDA';

            await this.data.updateAlert(
              alert.id,
              {
                estado: 'PERDIDA'
              }
            );
          }

          const date =
            new Date(alert.hora);

          const key =
            `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${alert.medicamentoId}`;

          let backgroundColor =
            '#3b82f6';

          const estado =
            alert.estado?.toLowerCase();

          if (estado === 'pendiente') {
            backgroundColor = '#f59e0b';
          }

          if (
            estado === 'tomada' ||
            estado === 'tomado'
          ) {
            backgroundColor = '#10b981';
          }

          if (
            estado === 'perdida' ||
            estado === 'omitido'
          ) {
            backgroundColor = '#ef4444';
          }

          if (!map.has(key)) {

            map.set(key, {

              id: alert.id,

              title: alert.nombre,

              start: date,

              allDay: true,

              backgroundColor,

              borderColor:
                backgroundColor,

              textColor: '#ffffff',

              display: 'block',

              extendedProps: {

                medicamentoId:
                  alert.medicamentoId,

                estado:
                  alert.estado
              }
            });
          }
        }

        this.calendarEvents =
          Array.from(map.values());

        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...this.calendarEvents]
        };

        if (this.selectedDate) {

          this.loadMedicamentsByDay(
            this.selectedDate
          );
        }
      });
  }

  loadMedicamentsByDay(date: Date) {

    this.selectedDate = date;

    const map = new Map();

    this.alerts.forEach(alert => {

      if (!alert.hora) return;

      const d =
        new Date(alert.hora);

      const sameDay =

        d.getDate() ===
        date.getDate()

        &&

        d.getMonth() ===
        date.getMonth()

        &&

        d.getFullYear() ===
        date.getFullYear();

      if (!sameDay) return;

      const key =
        alert.medicamentoId ||
        alert.nombre;

      if (!map.has(key)) {

        map.set(key, {

          medicamentoId:
            alert.medicamentoId,

          nombre:
            alert.nombre,

          imageUrl:
            alert.medicamentImageUrl,

          dosisBase:
            alert.dosisBase,

          alerts: []
        });
      }

      map.get(key).alerts.push(alert);
    });

    this.selectedDayMedicaments =
      Array.from(map.values());
  }

  // =========================
  // FILTRO
  // =========================

  setFilter(value: string) {

    this.filter = value;

    this.filteredMeds$ =
      this.medicaments$.pipe(
        map(meds => this.applyFilter(meds))
      );
  }

  applyFilter(meds: any[]) {

    return meds;
  }

  // =========================
  // CRUD MEDICAMENTO
  // =========================

  async addMedicament() {

    if (this.isSaving) return;

    this.isSaving = true;

    try {

      let imageUrl =
        this.newMedicament.imageUrl || '';

      if (this.selectedFile) {

        imageUrl =
          await this.storage.uploadImage(
            this.selectedFile
          );
      }

      const data = {

        nombre:
          this.newMedicament.nombre,

        descripcion:
          this.newMedicament.descripcion,

        imageUrl,

        fechaInicio:
          this.newMedicament.fechaInicio
            ? new Date(
                this.newMedicament.fechaInicio
              ).getTime()
            : null,

        fechaFin:
          this.newMedicament.fechaFin
            ? new Date(
                this.newMedicament.fechaFin
              ).getTime()
            : null
      };

      if (this.editingId) {

        await this.data.updateMedicament(
          this.editingId,
          data
        );

      } else {

        await this.data.addMedicament(
          data
        );
      }

      this.closeModal();

    } catch (e) {

      console.error(e);

      alert(
        'Error guardando medicamento'
      );

    } finally {

      this.isSaving = false;
    }
  }

  async deleteMedicament(id: string) {

    await this.data.deleteMedicament(id);

    if (this.selectedDate) {

      this.loadMedicamentsByDay(
        this.selectedDate
      );
    }
  }

  // =========================
  // MODAL MEDICAMENTO
  // =========================

  openAddModal() {

    if (!this.editingId) {

      this.newMedicament = {

        nombre: '',
        descripcion: '',
        imageUrl: '',
        fechaInicio: '',
        fechaFin: ''
      };

      this.previewUrl = null;

      this.selectedFile = null;
    }

    this.isAddModalOpen = true;
  }

  closeModal() {

    this.isAddModalOpen = false;

    this.editingId = null;
  }

  // =========================
  // MODAL ALERTA
  // =========================

  openAlertModal(med: any) {

    this.selectedMedicamentForAlert =
      med;

    this.newAlert = {

      hora: '',

      dosisBase: '',

      frecuencia:
        'Cada 24 horas'
    };

    this.isAlertModalOpen = true;
  }

  closeAlertModal() {

    this.isAlertModalOpen = false;
  }

  async createAlert() {

    if (!this.selectedMedicamentForAlert)
      return;

    const med =
      this.selectedMedicamentForAlert;

    const frecuencia =
      this.newAlert.frecuencia;

    let intervalHours = 24;

    if (
      frecuencia ===
      'Cada 12 horas'
    ) {
      intervalHours = 12;
    }

    if (
      frecuencia ===
      'Cada 8 horas'
    ) {
      intervalHours = 8;
    }

    if (
      frecuencia ===
      'Cada 6 horas'
    ) {
      intervalHours = 6;
    }

    const [hour, minute] =

      this.newAlert.hora
        .split(':')
        .map(Number);

    const inicio =
      new Date(med.fechaInicio);

    inicio.setHours(0,0,0,0);

    const fin =
      new Date(med.fechaFin);

    fin.setHours(23,59,59,999);

    const actual =
      new Date(inicio);

    while (actual <= fin) {

      let currentHour = hour;

      while (currentHour < 24) {

        const alarmaTime =
          new Date(actual);

        alarmaTime.setHours(
          currentHour,
          minute,
          0,
          0
        );

        const alerta = {

          nombre:
            med.nombre,

          medicamentoId:
            med.id,

          medicamentImageUrl:
            med.imageUrl || '',

          dosisBase:
            this.newAlert.dosisBase,

          frecuencia,

          hora:
            alarmaTime.getTime(),

          estado:

            alarmaTime.getTime()
            < Date.now()

              ? 'PERDIDA'

              : 'PENDIENTE'
        };

        await this.data.addAlert(
          alerta
        );

        currentHour +=
          intervalHours;
      }

      actual.setDate(
        actual.getDate() + 1
      );
    }

    this.isAlertModalOpen = false;

    this.closeDetail();

    this.loadCalendarEvents();
  }

  // =========================
  // DETAIL MODAL
  // =========================

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

    this.closeDetail();

    this.openAddModal();

    this.editingId = item.id;

    this.newMedicament = {

      nombre:
        item.nombre || '',

      descripcion:
        item.descripcion || '',

      imageUrl:
        item.imageUrl || '',

      fechaInicio:
        item.fechaInicio

          ? new Date(
              item.fechaInicio
            )
            .toISOString()
            .split('T')[0]

          : '',

      fechaFin:
        item.fechaFin

          ? new Date(
              item.fechaFin
            )
            .toISOString()
            .split('T')[0]

          : ''
    };

    this.previewUrl =
      item.imageUrl || null;

    this.selectedFile = null;
  }

  // =========================
  // FILE
  // =========================

  onFileChange(event: any) {

    this.selectedFile =
      event.target.files[0] || null;

    if (this.selectedFile) {

      this.previewUrl =
        URL.createObjectURL(
          this.selectedFile
        );
    }
  }
}