import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

  nextCita: any = null;
  nextAlert: any = null;
  nextMed: any = null;

  constructor(private data: DataService) {}

  ngOnInit() {

    // ================= CITAS =================
    this.data.getCitasMedicas().subscribe(citas => {

      const now = new Date();

      const futuras = citas
        .filter(c => c.descripcion && c.fecha && c.hora)
        .map(c => {

          // 🔥 CLAVE: crear fecha local REAL
          const [year, month, day] = c.fecha.split('-').map(Number);
          const [hour, minute] = c.hora.split(':').map(Number);

          const fechaReal = new Date(year, month - 1, day, hour, minute);

          return {
            ...c,
            fechaReal
          };
        })
        .filter(c => c.fechaReal > now)
        .sort((a, b) =>
          a.fechaReal.getTime() - b.fechaReal.getTime()
        );

      this.nextCita = futuras.length ? futuras[0] : null;
    });


    // ================= ALERTAS =================
    this.data.getAlerts().subscribe(alerts => {

      const now = new Date();

      const futuras = alerts
        .filter(a => a.nombre && a.hora)
        .map(alert => {

          const [h, m] = alert.hora.split(':');

          const fecha = new Date();
          fecha.setHours(+h, +m, 0, 0);

          return {
            ...alert,
            fechaCalculada: fecha
          };
        })
        .filter(a => a.fechaCalculada > now)
        .sort((a, b) =>
          a.fechaCalculada.getTime() - b.fechaCalculada.getTime()
        );

      this.nextAlert = futuras.length ? futuras[0] : null;
    });


    // ================= MEDICAMENTOS =================
    this.data.getMedicaments().subscribe(meds => {

      this.nextMed = meds.length ? meds[0] : null;
    });

  }
}