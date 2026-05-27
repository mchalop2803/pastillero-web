import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';

import { DataService } from '../../services/data';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, DetailModalComponent],
  templateUrl: './medications.html',
  styleUrls: ['./medications.css'],
})
export class Medications {

  medicaments$!: Observable<any[]>;
  alerts$!: Observable<any[]>;

  selectedItem: any = null;
  isDetailOpen = false;

  selectedDay: number = Date.now();

  // 🔥 calendario enriquecido
  calendarDays$!: Observable<any[]>;

  constructor(private data: DataService) {}

  ngOnInit() {

    this.medicaments$ = this.data.getMedicaments();
    this.alerts$ = this.data.getAlerts();

    this.buildCalendar();
  }

  // =========================
  // CALENDARIO
  // =========================

  buildCalendar() {

    this.calendarDays$ = combineLatest([
      this.medicaments$,
      this.alerts$
    ]).pipe(

      map(([meds, alerts]) => {

        const daysMap = new Map<number, any[]>();

        for (const alert of alerts) {

          const day = new Date(alert.hora).setHours(0,0,0,0);

          if (!daysMap.has(day)) {
            daysMap.set(day, []);
          }

          daysMap.get(day)!.push({
            ...alert,
            medicament: meds.find(m => m.id === alert.medicamentoId)
          });
        }

        return Array.from(daysMap.entries()).map(([day, items]) => {

          const hasMissed = items.some(i => i.estado === 'PERDIDA');
          const allTaken = items.every(i => i.estado === 'TOMADA');

          return {
            day,
            items,
            status:
              allTaken ? 'OK'
              : hasMissed ? 'WARN'
              : 'PENDING'
          };
        });
      })
    );
  }

  // =========================
  // UI
  // =========================

  selectDay(day: any) {
    this.selectedDay = day.day;
  }

  openDetail(item: any) {
    this.selectedItem = item;
    this.isDetailOpen = true;
  }

  closeDetail() {
    this.selectedItem = null;
    this.isDetailOpen = false;
  }

  // refresco manual (IMPORTANTE)
  refreshCalendar() {
    this.buildCalendar();
  }
}