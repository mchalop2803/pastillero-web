import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable, map } from 'rxjs';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { DataService } from '../../services/data';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    DetailModalComponent
  ],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css'],
})
export class Citas {

  // =========================
  // DATA
  // =========================
  citas$!: Observable<any[]>;
  citas: any[] = [];

  // =========================
  // CALENDAR
  // =========================
  calendarEvents: any[] = [];
  calendarOptions: any;

  selectedDayCitas: any[] = [];
  selectedDate: Date | null = null;

  // =========================
  // FORM
  // =========================
  newCita = {
    descripcion: '',
    fecha: '',
    hora: ''
  };

  isModalOpen = false;
  editingId: string | null = null;

  // =========================
  // DETAIL
  // =========================
  selectedItem: any = null;
  isDetailOpen = false;

  constructor(private data: DataService) {}

  // =========================
  // INIT
  // =========================
  ngOnInit() {

    this.citas$ = this.data.getCitasMedicas().pipe(

      map(citas =>
        citas.filter(c =>
          c.descripcion &&
          c.fecha &&
          c.hora
        )
      )
    );

    this.loadCitas();
    this.initCalendar();
  }

  // =========================
  // LOAD CITAS
  // =========================
  loadCitas() {

    this.data.getCitasMedicas().subscribe(citas => {

      this.citas = citas;

      this.calendarEvents = citas.map(cita => ({

        title: cita.descripcion,

        start: cita.fecha,

        allDay: true,

        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',

        extendedProps: {
          cita
        }
      }));

      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...this.calendarEvents]
      };

      if (this.selectedDate) {
        this.loadCitasByDay(this.selectedDate);
      }
    });
  }

  // =========================
  // CALENDAR
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

      dayMaxEvents: true,

      dateClick: (info: any) => {

        this.loadCitasByDay(info.date);
      }
    };
  }

  // =========================
  // DAY CITAS
  // =========================
  loadCitasByDay(date: Date) {

    this.selectedDate = date;

    this.selectedDayCitas = this.citas.filter(cita => {

      const d = new Date(cita.fecha);

      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  }

  // =========================
  // MODAL
  // =========================
  openAddModal() {

    this.isModalOpen = true;

    this.editingId = null;

    this.newCita = {
      descripcion: '',
      fecha: '',
      hora: ''
    };
  }

  closeModal() {

    this.isModalOpen = false;

    this.newCita = {
      descripcion: '',
      fecha: '',
      hora: ''
    };

    this.editingId = null;
  }

  // =========================
  // CRUD
  // =========================
  addCita() {

    if (
      !this.newCita.descripcion ||
      !this.newCita.fecha ||
      !this.newCita.hora
    ) return;

    const data = {
      descripcion: this.newCita.descripcion,
      fecha: this.newCita.fecha,
      hora: this.newCita.hora
    };

    if (this.editingId) {

      this.data.updateCita(this.editingId, data);

    } else {

      this.data.addCita(data);
    }

    this.closeModal();
  }

  deleteCita(id: string) {
    this.data.deleteCita(id);
  }

  // =========================
  // DETAIL
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

    this.deleteCita(item.id);
    this.closeDetail();
  }

  editFromModal(item: any) {

    this.editingId = item.id;

    this.newCita = {
      descripcion: item.descripcion,
      fecha: item.fecha || '',
      hora: item.hora || ''
    };

    this.closeDetail();

    this.isModalOpen = true;
  }
}