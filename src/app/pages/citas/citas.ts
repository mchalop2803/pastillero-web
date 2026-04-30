import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable, map } from 'rxjs';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, DetailModalComponent],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css'],
})
export class Citas {

  citas$!: Observable<any[]>;

  newCita = {
    descripcion: '',
    fecha: '',
    hora: ''
  };

  isModalOpen = false;
  editingId: string | null = null;

  selectedItem: any = null;
  isDetailOpen = false;

  constructor(private data: DataService) {}

  ngOnInit() {

    this.citas$ = this.data.getCitasMedicas().pipe(

      map(citas =>
        citas.filter(c =>
          c.descripcion &&
          c.fecha &&
          c.hora
        )
      )
    );
  }

  openAddModal() {
    this.isModalOpen = true;
    this.editingId = null;

    this.newCita = {
      descripcion: '',
      fecha: '',
      hora: ''
    };
  }

  closeModal() {
    this.isModalOpen = false;

    this.newCita = {
      descripcion: '',
      fecha: '',
      hora: ''
    };

    this.editingId = null;
  }

  // ================= CRUD =================

  addCita() {

    if (!this.newCita.descripcion ||
        !this.newCita.fecha ||
        !this.newCita.hora) return;

    const data = {
      descripcion: this.newCita.descripcion,
      fecha: this.newCita.fecha,
      hora: this.newCita.hora
    };

    if (this.editingId) {
      this.data.updateCita(this.editingId, data);
    } else {
      this.data.addCita(data);
    }

    this.closeModal();
  }

  deleteCita(id: string) {
    this.data.deleteCita(id);
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
    this.deleteCita(item.id);
    this.closeDetail();
  }

  editFromModal(item: any) {

    this.editingId = item.id;

    this.newCita = {
      descripcion: item.descripcion,
      fecha: item.fecha || '',
      hora: item.hora || ''
    };

    this.closeDetail();
    this.isModalOpen = true;
  }
}