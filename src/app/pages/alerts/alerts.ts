import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';
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
    this.alerts$ = this.data.getAlerts();
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
    this.data.deleteAlert(item.id);
    this.closeDetail();
  }
}