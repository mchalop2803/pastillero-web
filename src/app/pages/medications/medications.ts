import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Observable, firstValueFrom, map } from 'rxjs';

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

calendarOptions: any;

filter = 'TODOS';

isSaving = false;

isAddModalOpen = false;

editingId: string | null = null;

selectedItem: any = null;

isDetailOpen = false;

selectedFile: File | null = null;

previewUrl: string | null = null;

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

  dateClick: (info: any) => {

    this.loadMedicamentsByDay(info.date);
  }
};

}

loadCalendarEvents() {

this.data.getAlerts().subscribe(alerts => {

  const map = new Map();

  alerts.forEach(alert => {

    if (!alert.hora) return;

    const date =
      new Date(alert.hora);

    const key =
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${alert.medicamentoId}`;

    if (!map.has(key)) {

      map.set(key, {

        title: alert.nombre,

        start: date,

        allDay: true,

        extendedProps: {
          medicamentoId: alert.medicamentoId
        }
      });
    }
  });

  this.calendarEvents =
    Array.from(map.values());

  this.calendarOptions = {
    ...this.calendarOptions,
    events: this.calendarEvents
  };
});

}

loadMedicamentsByDay(date: Date) {

this.selectedDate = date;

this.data.getAlerts().subscribe(alerts => {

  const map = new Map();

  alerts.forEach(alert => {

    if (!alert.hora) return;

    const d =
      new Date(alert.hora);

    const sameDay =

      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear();

    if (!sameDay) return;

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
// CRUD
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

      await this.data.updateMedicament(
        this.editingId,
        data
      );

    } else {

      await this.data.addMedicament(data);
    }

    this.closeModal();

  } catch (e) {

    console.error(e);

    alert('Error guardando medicamento');

  } finally {

    this.isSaving = false;
  }
}

async deleteMedicament(id: string) {

await this.data.deleteMedicament(id);

}

// =========================
// MODALES
// =========================

openAddModal() {

  this.editingId = null;

  this.newMedicament = {
    nombre: '',
    descripcion: '',
    imageUrl: '',
    fechaInicio: '',
    fechaFin: ''
  };

  this.previewUrl = null;
  this.selectedFile = null;

  this.isAddModalOpen = true;
}

closeModal() {

this.isAddModalOpen = false;

this.editingId = null;

}

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

  this.newMedicament = {
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    imageUrl: item.imageUrl || '',

    fechaInicio: item.fechaInicio
      ? new Date(item.fechaInicio).toISOString().split('T')[0]
      : '',

    fechaFin: item.fechaFin
      ? new Date(item.fechaFin).toISOString().split('T')[0]
      : ''
  };

  this.previewUrl = item.imageUrl || null;
  this.selectedFile = null;

  this.closeDetail();
  this.isAddModalOpen = true;
}

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
