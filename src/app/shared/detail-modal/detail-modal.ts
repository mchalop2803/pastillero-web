import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-modal.html'
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
}