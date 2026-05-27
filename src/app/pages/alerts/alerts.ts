import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DataService } from '../../services/data';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // 🔥 ESTO ES LO QUE TE FALTA
    DetailModalComponent
  ],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.css'],
})
export class Alerts {

  alerts$!: Observable<any[]>;

  selectedItem: any = null;
  isDetailOpen = false;

  selectedMedicament: any = null;

  newAlert = {
    hora: '',
    dosisBase: '',
    frecuencia: 'Cada 24 horas'
  };

  constructor(
    private data: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.refreshAlerts();

    this.route.params.subscribe(async params => {
      const id = params['id'];

      if (id) {
        const meds = await firstValueFrom(
          this.data.getMedicaments()
        );

        this.selectedMedicament =
          meds.find((m: any) => m.id === id);
      }
    });
  }

  refreshAlerts() {
    this.alerts$ = this.data.getAlerts();
  }

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
    this.closeDetail();
  }

  async takenAlert(item: any) {
    const dosis = prompt('Introduce la dosis tomada');
    if (!dosis) return;

    const now = new Date();

    await this.data.updateAlert(item.id, {
      estado: 'TOMADA',
      dosisTomada: dosis,
      horaTomada: `${now.getHours()}:${now.getMinutes()}`
    });

    this.refreshAlerts();
  }

  async missedAlert(item: any) {
    await this.data.updateAlert(item.id, {
      estado: 'PERDIDA'
    });

    this.refreshAlerts();
  }

  async createAlertsFromMedicament() {

    const med = this.selectedMedicament;
    if (!med) return;

    const [hour, minute] =
      this.newAlert.hora.split(':').map(Number);

    let interval = 24;

    if (this.newAlert.frecuencia === 'Cada 12 horas') interval = 12;
    if (this.newAlert.frecuencia === 'Cada 8 horas') interval = 8;
    if (this.newAlert.frecuencia === 'Cada 6 horas') interval = 6;

    const start = new Date(med.fechaInicio);
    const end = new Date(med.fechaFin);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const current = new Date(start);

    while (current <= end) {

      let alarm = new Date(current);

      alarm.setHours(hour, minute, 0, 0);

      while (alarm.getDate() === current.getDate()) {

        await this.data.addAlert({
          nombre: med.nombre,
          medicamentoId: med.id,
          medicamentImageUrl: med.imageUrl,
          dosisBase: this.newAlert.dosisBase,
          hora: alarm.getTime(),
          estado:
            alarm.getTime() < Date.now()
              ? 'PERDIDA'
              : 'PENDIENTE'
        });

        alarm.setHours(alarm.getHours() + interval);
      }

      current.setDate(current.getDate() + 1);
    }

    this.refreshAlerts();
  }
}