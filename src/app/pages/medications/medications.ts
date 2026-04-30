import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { StorageService } from '../../services/storage.service';
import { Observable, map } from 'rxjs';
import { DetailModalComponent } from '../../shared/detail-modal/detail-modal';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, FormsModule, DetailModalComponent],
  templateUrl: './medications.html',
  styleUrls: ['./medications.css'],
})
export class Medications {

  medicaments$!: Observable<any[]>;
  filteredMeds$!: Observable<any[]>;

  filter: string = 'ALL';

  newMedicament: any = {
    nombre: '',
    dosis: '',
    momentDay: '',
    horario: '',
    imageUrl: ''
  };

  selectedFile: File | null = null;

  isAddModalOpen = false;
  editingId: string | null = null;

  selectedItem: any = null;
  isDetailOpen = false;

  constructor(
    private data: DataService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.medicaments$ = this.data.getMedicaments().pipe(
      map(meds => this.translateMomentDay(meds))
    );

    this.filteredMeds$ = this.medicaments$.pipe(
      map(meds => this.applyFilter(meds))
    );
  }

  // ================= TRADUCCIÓN SOLO TEXTO =================

  private translateMomentDay(meds: any[]) {
    return meds.map(m => ({
      ...m,
      momentDayUI: this.toEnglish(m.momentDay)
    }));
  }

  private toEnglish(value: string): string {
    switch (value) {
      case 'DIA': return 'DAY';
      case 'TARDE': return 'AFTERNOON';
      case 'NOCHE': return 'NIGHT';
      default: return value;
    }
  }

  // ================= FILTRO =================

  setFilter(value: string) {
    this.filter = value;

    this.filteredMeds$ = this.medicaments$.pipe(
      map(meds => this.applyFilter(meds))
    );
  }

  applyFilter(meds: any[]) {
    if (this.filter === 'ALL') return meds;

    return meds.filter(m => {
      const value = (m.momentDayUI || '').toLowerCase();

      if (this.filter === 'DAY') return value === 'day';
      if (this.filter === 'AFTERNOON') return value === 'afternoon';
      if (this.filter === 'NIGHT') return value === 'night';

      return false;
    });
  }

  // ================= MODAL =================

  openAddModal() {
    this.isAddModalOpen = true;
    this.editingId = null;

    this.newMedicament = {
      nombre: '',
      dosis: '',
      momentDay: '',
      horario: '',
      imageUrl: ''
    };

    this.selectedFile = null;
  }

  closeModal() {
    this.isAddModalOpen = false;

    this.newMedicament = {
      nombre: '',
      dosis: '',
      momentDay: '',
      horario: '',
      imageUrl: ''
    };

    this.selectedFile = null;
    this.editingId = null;
  }

  // ================= MOMENTO DEL DÍA =================

  private calculateMomentDay(horario: string): string {
    if (!horario) return '';

    const h = parseInt(horario.split(':')[0], 10);

    if (h >= 5 && h < 12) return 'DIA';
    if (h >= 12 && h < 20) return 'TARDE';
    return 'NOCHE';
  }

  // ================= CRUD =================

  async addMedicament() {

  if (!this.newMedicament.nombre ||
      !this.newMedicament.dosis ||
      !this.newMedicament.horario) return;

  let imageUrl: string = '';

  try {
    if (this.selectedFile) {
      console.log('📤 Subiendo imagen...');
      imageUrl = await this.storage.uploadImage(this.selectedFile);
      console.log('✅ Imagen subida:', imageUrl);
    }
  } catch (err) {
    console.error('🔥 ERROR SUBIENDO IMAGEN:', err);
    alert('Error subiendo imagen');
    return; // 🔴 corta SOLO si falla subida
  }

  const momentDay = this.calculateMomentDay(this.newMedicament.horario);

  const medicamentData = {
    nombre: this.newMedicament.nombre,
    dosis: this.newMedicament.dosis,
    horario: this.newMedicament.horario,
    momentDay,
    imageUrl
  };

  try {

    if (this.editingId) {

      await this.data.updateMedicament(this.editingId, medicamentData);

      await this.data.updateAlertByMedicament(this.editingId, {
        nombre: medicamentData.nombre,
        hora: medicamentData.horario
      });

    } else {

      const newId = await this.data.addMedicament(medicamentData);

      await this.data.addAlert({
        medicamentId: newId,
        nombre: medicamentData.nombre,
        hora: medicamentData.horario
      });
    }

    console.log('✅ Medicamento guardado');
    this.closeModal();

  } catch (err) {
    console.error('🔥 ERROR GUARDANDO EN DB:', err);
  }
}

  deleteMedicament(id: string) {
    this.data.deleteMedicament(id);
    this.data.deleteAlertByMedicament(id);
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] || null;
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
    this.deleteMedicament(item.id);
    this.closeDetail();
  }

  editFromModal(item: any) {

    this.editingId = item.id;

    this.newMedicament = {
      nombre: item.nombre,
      dosis: item.dosis,
      momentDay: item.momentDay || '',
      horario: item.horario || '',
      imageUrl: item.imageUrl || ''
    };

    this.selectedFile = null;

    this.closeDetail();
    this.isAddModalOpen = true;
  }
}