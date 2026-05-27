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

  // ALERT MODAL
  isAlertModalOpen = false;
  selectedMedicamentForAlert: any = null;

  newAlert: any = {
    hora: '',
    dosisBase: '',
    frecuencia: 'Cada 24 horas'
  };

  // MEDICAMENTO
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

    this.medicaments$ = this.data.getMedicaments();

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
      plugins: [dayGridPlugin, interactionPlugin],
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

    this.alertsSub = this.data.getAlerts().subscribe(async alerts => {

      this.alerts = alerts;

      const map = new Map();

      const now = Date.now();

      for (const alert of alerts) {

        if (!alert.hora) continue;

        // AUTO MARK PERDIDA
        if (
          alert.estado !== 'TOMADA' &&
          alert.estado !== 'PERDIDA' &&
          alert.hora < now
        ) {
          alert.estado = 'PERDIDA';

          await this.data.updateAlert(alert.id, {
            estado: 'PERDIDA'
          });
        }

        const date = new Date(alert.hora);

        const key =
          `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${alert.medicamentoId}`;

        let color = '#3b82f6';

        const estado = alert.estado?.toLowerCase();

        if (estado === 'pendiente') color = '#f59e0b';
        if (estado === 'tomada') color = '#10b981';
        if (estado === 'perdida') color = '#ef4444';

        if (!map.has(key)) {
          map.set(key, {
            id: alert.id,
            title: alert.nombre,
            start: date,
            allDay: true,
            backgroundColor: color,
            borderColor: color,
            textColor: '#fff',
            display: 'block',
            extendedProps: {
              medicamentoId: alert.medicamentoId,
              estado: alert.estado
            }
          });
        }
      }

      this.calendarEvents = Array.from(map.values());

      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...this.calendarEvents]
      };

      if (this.selectedDate) {
        this.loadMedicamentsByDay(this.selectedDate);
      }
    });
  }

  // =========================
  // MEDICAMENTOS DEL DÍA
  // =========================

  loadMedicamentsByDay(date: Date) {

    this.selectedDate = date;

    const map = new Map();

    this.alerts.forEach(alert => {

      if (!alert.hora) return;

      const d = new Date(alert.hora);

      const sameDay =
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear();

      if (!sameDay) return;

      const key = alert.medicamentoId || alert.nombre;

      if (!map.has(key)) {
        map.set(key, {
          id: alert.medicamentoId,
          nombre: alert.nombre,
          imageUrl: alert.medicamentImageUrl,
          dosisBase: alert.dosisBase,
          alerts: []
        });
      }

      map.get(key).alerts.push(alert);
    });

    this.selectedDayMedicaments = Array.from(map.values());
  }

  // =========================
  // FILTRO
  // =========================

  setFilter(value: string) {
    this.filter = value;
  }

  applyFilter(meds: any[]) {
    return meds;
  }

  // =========================
  // CRUD
  // =========================

  async addMedicament() {

    if (this.isSaving) return;

    this.isSaving = true;

    try {

      let imageUrl = this.newMedicament.imageUrl || '';

      if (this.selectedFile) {
        imageUrl = await this.storage.uploadImage(this.selectedFile);
      }

      const data = {
        nombre: this.newMedicament.nombre,
        descripcion: this.newMedicament.descripcion,
        imageUrl,
        fechaInicio: this.newMedicament.fechaInicio
          ? new Date(this.newMedicament.fechaInicio).getTime()
          : null,
        fechaFin: this.newMedicament.fechaFin
          ? new Date(this.newMedicament.fechaFin).getTime()
          : null
      };

      if (this.editingId) {
        await this.data.updateMedicament(this.editingId, data);
      } else {
        await this.data.addMedicament(data);
      }

      this.closeModal();

    } finally {
      this.isSaving = false;
    }
  }

  async deleteMedicament(id: string) {
    await this.data.deleteMedicament(id);

    if (this.selectedDate) {
      this.loadMedicamentsByDay(this.selectedDate);
    }
  }

  // =========================
  // DETAIL
  // =========================

  openDetail(item: any) {
    this.selectedItem = item;
    this.isDetailOpen = true;
  }

  closeDetail() {
    this.selectedItem = null;
    this.isDetailOpen = false;
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
      nombre: item.nombre,
      descripcion: item.descripcion,
      imageUrl: item.imageUrl,
      fechaInicio: item.fechaInicio
        ? new Date(item.fechaInicio).toISOString().split('T')[0]
        : '',
      fechaFin: item.fechaFin
        ? new Date(item.fechaFin).toISOString().split('T')[0]
        : ''
    };
  }

  // =========================
  // ALERTAS DESDE MEDICAMENTO (NUEVO)
  // =========================

  openAlertModal(med: any) {

    this.selectedMedicamentForAlert = med;

    this.newAlert = {
      hora: '',
      dosisBase: '',
      frecuencia: 'Cada 24 horas'
    };

    this.isAlertModalOpen = true;
  }

  async createAlert() {

    const med = this.selectedMedicamentForAlert;
    if (!med) return;

    const [hour, minute] = this.newAlert.hora.split(':').map(Number);

    const inicio = new Date(med.fechaInicio);
    const fin = new Date(med.fechaFin);

    inicio.setHours(0,0,0,0);
    fin.setHours(23,59,59,999);

    const current = new Date(inicio);

    while (current <= fin) {

      const alarm = new Date(current);
      alarm.setHours(hour, minute, 0, 0);

      await this.data.addAlert({
        nombre: med.nombre,
        medicamentoId: med.id,
        medicamentImageUrl: med.imageUrl,
        dosisBase: this.newAlert.dosisBase,
        hora: alarm.getTime(),
        estado: alarm.getTime() < Date.now() ? 'PERDIDA' : 'PENDIENTE'
      });

      current.setDate(current.getDate() + 1);
    }

    this.isAlertModalOpen = false;
    this.loadCalendarEvents();
  }

  closeModal() {
    this.isAddModalOpen = false;
    this.editingId = null;
  }

  openAddModal() {
    this.isAddModalOpen = true;
  }

  onFileChange(e: any) {
    this.selectedFile = e.target.files[0];
  }
}