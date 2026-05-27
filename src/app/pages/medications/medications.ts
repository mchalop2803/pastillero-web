import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { DataService } from '../../services/data';
import { StorageService } from '../../services/storage.service';
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

  selectedItem: any = null;
  isDetailOpen = false;

  constructor(
    private data: DataService,
    private storage: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.medicaments$ = this.data.getMedicaments();
  }

  // =========================
  // DETAIL MEDICATION
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
    this.data.deleteMedicament(item.id);
    this.closeDetail();
  }

  editFromModal(item: any) {
    // aquí ya tienes tu lógica de edición si la necesitas
  }

  // =========================
  // ANDROID STYLE NAVIGATION
  // =========================

  openAlertModal(med: any) {
    this.closeDetail();

    this.router.navigate(['/alerts'], {
      state: { medicament: med }
    });
  }
}