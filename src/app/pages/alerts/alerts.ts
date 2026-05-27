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

    this.alerts$ = this.data.getAlerts().pipe(

      map(alerts => {

        return alerts.map(alert => {

          if (
            alert.estado !== 'TOMADA' &&
            alert.estado !== 'PERDIDA' &&
            alert.hora < Date.now()
          ) {

            const diff =
              Date.now() - alert.hora;

            const limit =
              30 * 60 * 1000;

            if (diff > limit) {

              this.data.updateAlert(alert.id, {
                estado: 'PERDIDA'
              });

              alert.estado = 'PERDIDA';
            }
          }

          return alert;
        });
      })
    );
  }

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

    this.closeDetail();
  }

  async takenAlert(item: any) {

    const dosis =
      prompt('Introduce la dosis tomada');

    if (dosis === null) return;

    const now = new Date();

    const horaTomada =
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    await this.data.updateAlert(item.id, {

      estado: 'TOMADA',

      dosisTomada: dosis,

      horaTomada
    });

    item.estado = 'TOMADA';
  }

  async missedAlert(item: any) {

    await this.data.updateAlert(item.id, {
      estado: 'PERDIDA'
    });

    item.estado = 'PERDIDA';
  }
}