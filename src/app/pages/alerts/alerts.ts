import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { Observable, map } from 'rxjs';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, DetailModalComponent],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.css'],
})
export class Alerts {

  alerts$!: Observable<any[]>;

  selectedItem: any = null;
  isDetailOpen = false;

  constructor(private data: DataService) {}

  ngOnInit() {
    this.refreshAlerts();
  }

  // =========================
  // REFRESH REACTIVO
  // =========================
  refreshAlerts() {

    this.alerts$ = this.data.getAlerts().pipe(

      map(alerts => {

        const now = Date.now();

        return alerts.map(alert => {

          const copy = { ...alert };

          // AUTO MARK AS MISSED
          if (
            copy.estado !== 'TOMADA' &&
            copy.estado !== 'PERDIDA' &&
            copy.hora < now
          ) {
            const diff = now - copy.hora;
            const limit = 30 * 60 * 1000;

            if (diff > limit) {

              copy.estado = 'PERDIDA';

              this.data.updateAlert(copy.id, {
                estado: 'PERDIDA'
              });
            }
          }

          return copy;
        });
      })
    );
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

  async deleteFromModal(item: any) {

    await this.data.deleteAlert(item.id);
    this.refreshAlerts();
    this.closeDetail();
  }

  // =========================
  // ACTIONS (ANDROID STYLE)
  // =========================

  async takenAlert(item: any) {

    const dosis = prompt('Introduce la dosis tomada');
    if (dosis === null) return;

    const now = new Date();

    const horaTomada =
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    await this.data.updateAlert(item.id, {
      estado: 'TOMADA',
      dosisTomada: dosis,
      horaTomada
    });

    this.refreshAlerts();
  }

  async missedAlert(item: any) {

    await this.data.updateAlert(item.id, {
      estado: 'PERDIDA'
    });

    this.refreshAlerts();
  }
}