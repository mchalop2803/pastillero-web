import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './detail-modal.html',
  styleUrls: ['./detail-modal.css']
})
export class DetailModalComponent {

  @Input() visible = false;
  @Input() item: any;
  @Input() type: string = '';

  @Output() close = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() addAlert = new EventEmitter();
  @Output() taken = new EventEmitter();
  @Output() missed = new EventEmitter();

  closeModal() {
    this.close.emit();
  }

  deleteItem() {
    this.delete.emit(this.item);
  }

  editItem() {
    this.edit.emit(this.item);
  }

  addAlertToMedicament() {
    this.addAlert.emit(this.item);
  }

  markAsTaken() {
    const dosis = prompt('Dosis tomada');
    if (dosis === null) return;

    this.taken.emit({
      ...this.item,
      dosisTomada: dosis
    });
  }

  markAsMissed() {
    this.missed.emit(this.item);
  }

  get isTaken(): boolean {
    return this.item?.estado === 'TOMADA';
  }

  get isMissed(): boolean {
    return this.item?.estado === 'PERDIDA';
  }

  get canTakeActions(): boolean {
    if (!this.item?.hora) return false;

    return Date.now() >= this.item.hora && !this.isTaken;
  }

  get formattedHour(): string {
    if (!this.item?.hora) return '';

    return new Date(this.item.hora).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}