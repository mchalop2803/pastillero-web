import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../../services/data';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, DetailModalComponent],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.css'],
})
export class Alerts {

  alerts$!: Observable<any[]>;

  selectedItem: any = null;
  isDetailOpen = false;

  selectedMedicament: any = null;

  isCreateOpen = false;

  newAlert = {
    hora: '',
    dosisBase: '',
    frecuencia: 'Cada 24 horas'
  };

  constructor(
    private data: DataService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {

    this.refreshAlerts();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const meds = await firstValueFrom(this.data.getMedicaments());
      this.selectedMedicament = meds.find((m: any) => m.id === id);

      this.isCreateOpen = true;
    }
  }

  refreshAlerts() {
    this.alerts$ = this.data.getAlerts();
  }

  openCreateModal() {
    this.isCreateOpen = true;
  }

  closeCreateModal() {
    this.isCreateOpen = false;
  }

  // =========================
  // CREATE
  // =========================

  async createAlertsFromMedicament() {

    const med = this.selectedMedicament;
    if (!med) return;

    const [hour, minute] = this.newAlert.hora.split(':').map(Number);

    let interval = 24;
    if (this.newAlert.frecuencia === 'Cada 12 horas') interval = 12;
    if (this.newAlert.frecuencia === 'Cada 8 horas') interval = 8;
    if (this.newAlert.frecuencia === 'Cada 6 horas') interval = 6;

    const start = new Date(med.fechaInicio);
    const end = new Date(med.fechaFin);

    const current = new Date(start);

    while (current <= end) {

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

    this.refreshAlerts();
    this.closeCreateModal();
  }

  // DETAIL (igual que antes)
  openDetail(item: any) {
    this.selectedItem = item;
    this.isDetailOpen = true;
  }

  closeDetail() {
    this.selectedItem = null;
    this.isDetailOpen = false;
  }

  async deleteFromModal(item: any) {
    await this.data.deleteAlert(item.id);
    this.refreshAlerts();
  }

  async takenAlert(item: any) {
    await this.data.updateAlert(item.id, { estado: 'TOMADA' });
    this.refreshAlerts();
  }

  async missedAlert(item: any) {
    await this.data.updateAlert(item.id, { estado: 'PERDIDA' });
    this.refreshAlerts();
  }
}