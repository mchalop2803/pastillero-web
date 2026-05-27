import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-modal.html',
  styleUrls: ['./detail-modal.css']
})
export class DetailModalComponent {

  @Input() visible = false;
  @Input() item: any;
  @Input() type: 'medication' | 'alert' | 'create-alert' = 'medication';

  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() createAlert = new EventEmitter<any>();
  @Output() taken = new EventEmitter<any>();
  @Output() missed = new EventEmitter<any>();

  closeModal() {
    this.close.emit();
  }

  deleteItem() {
    this.delete.emit(this.item);
  }

  editItem() {
    this.edit.emit(this.item);
  }

  createAlertFromMedication() {
    this.createAlert.emit(this.item);
  }

  markAsTaken() {
    const dosis = prompt('Dosis tomada');
    if (!dosis) return;

    this.taken.emit({
      ...this.item,
      dosisTomada: dosis
    });
  }

  markAsMissed() {
    this.missed.emit(this.item);
  }

  get formattedHour(): string {
    if (!this.item?.hora) return '';
    return new Date(this.item.hora).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get canTakeActions(): boolean {
    return this.item?.hora &&
      Date.now() >= this.item.hora &&
      this.item.estado !== 'TOMADA';
  }
}