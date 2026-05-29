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
  alerts: any[] = [];
  filteredAlerts: any[] = [];

  medicamentos: string[] = [];

  selectedMedicamento = 'Todos';

  fechaInicio = '';
  fechaFin = '';

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

    this.data.getAlerts().subscribe(alerts => {

      this.alerts = alerts;

      this.filteredAlerts = alerts;

      this.loadMedicamentos();

      this.applyFilters();
    });
  }

  loadMedicamentos() {

    const nombres = this.alerts.map(a => a.nombre);

    this.medicamentos = [...new Set(nombres)];
  }

  applyFilters() {

    this.filteredAlerts = this.alerts.filter(alert => {

      // FILTRO MEDICAMENTO
      const coincideMedicamento =
        this.selectedMedicamento === 'Todos'
        || alert.nombre === this.selectedMedicamento;

      // FILTRO FECHAS
      let coincideFecha = true;

      const alertDate = new Date(alert.hora);

      if (this.fechaInicio) {

        const inicio = new Date(this.fechaInicio);
        inicio.setHours(0,0,0,0);

        coincideFecha =
          coincideFecha &&
          alertDate >= inicio;
      }

      if (this.fechaFin) {

        const fin = new Date(this.fechaFin);
        fin.setHours(23,59,59,999);

        coincideFecha =
          coincideFecha &&
          alertDate <= fin;
      }

      return coincideMedicamento && coincideFecha;
    });
  }

  onFechaInicioChange() {

    if (
      this.fechaFin &&
      this.fechaFin < this.fechaInicio
    ) {
      this.fechaFin = '';
    }

    this.applyFilters();
  }

  openCreateModal() {
    this.isCreateOpen = true;
  }

  closeCreateModal() {
    this.isCreateOpen = false;
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