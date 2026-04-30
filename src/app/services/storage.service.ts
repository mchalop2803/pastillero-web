import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private storage = inject(Storage);
  private auth = inject(Auth);

  async uploadImage(file: File): Promise<string> {

    if (!file) throw new Error('No file');

    const user = this.auth.currentUser;
    if (!user?.uid) throw new Error('User not authenticated');

    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      throw new Error('Solo PNG o JPG');
    }

    const filePath = `medicaments_images/${user.uid}/${Date.now()}_${file.name}`;

    const storageRef = ref(this.storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);

    return await getDownloadURL(snapshot.ref);
  }
}