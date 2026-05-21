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
  @Input() type: string = '';

  @Output() close = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() edit = new EventEmitter();

  closeModal() {
    this.close.emit();
  }

  deleteItem() {
    this.delete.emit(this.item);
  }

  editItem() {
    this.edit.emit(this.item);
  }

  get momentoNormalizado(): string {

  const value = this.item?.momentoDia || this.item?.momentDay;

  if (!value) return '';

  if (value === 'DIA' || value === 'MAÑANA') return 'MAÑANA';
  if (value === 'TARDE') return 'TARDE';
  if (value === 'NOCHE') return 'NOCHE';

  return value;
}
}