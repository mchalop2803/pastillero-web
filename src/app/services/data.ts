import { Injectable, inject } from '@angular/core';

import {
  Database,
  ref,
  push,
  remove,
  update,
  onValue,
  off
} from '@angular/fire/database';

import {
  Auth,
  authState
} from '@angular/fire/auth';

import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private db = inject(Database);

  private auth = inject(Auth);

  // =====================================================
  // USER
  // =====================================================

  private async getUser() {

    const user =
      await firstValueFrom(
        authState(this.auth)
      );

    if (!user?.uid) {
      throw new Error('No user authenticated');
    }

    return user;
  }

  private refPath(
    path: string,
    uid: string
  ) {

    return ref(
      this.db,
      `users/${uid}/${path}`
    );
  }

  private toArray(data: any): any[] {

    if (!data) return [];

    return Object.entries(data).map(
      ([id, value]: any) => ({
        id,
        ...value
      })
    );
  }

  // =====================================================
  // MEDICAMENTS
  // =====================================================

  getMedicaments(): Observable<any[]> {

    return new Observable(observer => {

      let currentRef: any = null;

      const sub =
        authState(this.auth)
          .subscribe(user => {

            if (!user?.uid) {
              observer.next([]);
              return;
            }

            if (currentRef) {
              off(currentRef);
            }

            currentRef =
              this.refPath(
                'medicaments',
                user.uid
              );

            onValue(currentRef, snap => {

              observer.next(
                this.toArray(snap.val())
              );

            });
          });

      return () => {

        sub.unsubscribe();

        if (currentRef) {
          off(currentRef);
        }
      };
    });
  }

  async addMedicament(data: any) {

    const user =
      await this.getUser();

    const r =
      await push(
        this.refPath(
          'medicaments',
          user.uid
        ),
        data
      );

    return r.key;
  }

  async updateMedicament(
    id: string,
    data: any
  ) {

    const user =
      await this.getUser();

    await update(
      ref(
        this.db,
        `users/${user.uid}/medicaments/${id}`
      ),
      data
    );

    // 🔥 ACTUALIZAR ALERTAS RELACIONADAS
    await this.updateAlertsByMedicament(
      id,
      {
        nombre: data.nombre,
        medicamentImageUrl: data.imageUrl
      }
    );
  }

  async deleteMedicament(id: string) {

    const user =
      await this.getUser();

    if (!user) return;

    // 🔥 BORRAR ALERTAS ASOCIADAS
    await this.deleteAlertsByMedicament(id);

    return remove(
      ref(
        this.db,
        `users/${user.uid}/medicaments/${id}`
      )
    );
  }

  // =====================================================
  // CITAS
  // =====================================================

  getCitasMedicas(): Observable<any[]> {

    return new Observable(observer => {

      let currentRef: any = null;

      const sub =
        authState(this.auth)
          .subscribe(user => {

            if (!user?.uid) {
              observer.next([]);
              return;
            }

            if (currentRef) {
              off(currentRef);
            }

            currentRef =
              this.refPath(
                'citaMedics',
                user.uid
              );

            onValue(currentRef, snap => {

              observer.next(
                this.toArray(snap.val())
              );

            });
          });

      return () => {

        sub.unsubscribe();

        if (currentRef) {
          off(currentRef);
        }
      };
    });
  }

  async addCita(data: any) {

    const user =
      await this.getUser();

    return push(
      this.refPath(
        'citaMedics',
        user.uid
      ),
      data
    );
  }

  async updateCita(
    id: string,
    data: any
  ) {

    const user =
      await this.getUser();

    return update(
      ref(
        this.db,
        `users/${user.uid}/citaMedics/${id}`
      ),
      data
    );
  }

  async deleteCita(id: string) {

    const user =
      await this.getUser();

    return remove(
      ref(
        this.db,
        `users/${user.uid}/citaMedics/${id}`
      )
    );
  }

  // =====================================================
  // ALERTS
  // =====================================================

  getAlerts(): Observable<any[]> {

    return new Observable(observer => {

      let currentRef: any = null;

      const sub =
        authState(this.auth)
          .subscribe(user => {

            if (!user?.uid) {
              observer.next([]);
              return;
            }

            if (currentRef) {
              off(currentRef);
            }

            currentRef =
              this.refPath(
                'alerts',
                user.uid
              );

            onValue(currentRef, snap => {

              observer.next(
                this.toArray(snap.val())
              );

            });
          });

      return () => {

        sub.unsubscribe();

        if (currentRef) {
          off(currentRef);
        }
      };
    });
  }

  async addAlert(data: any) {

    const user =
      await this.getUser();

    const r =
      await push(
        this.refPath(
          'alerts',
          user.uid
        ),
        data
      );

    return r.key;
  }

  async updateAlert(
    id: string,
    data: any
  ) {

    const user =
      await this.getUser();

    return update(
      ref(
        this.db,
        `users/${user.uid}/alerts/${id}`
      ),
      data
    );
  }

  async deleteAlert(id: string) {

    const user =
      await this.getUser();

    return remove(
      ref(
        this.db,
        `users/${user.uid}/alerts/${id}`
      )
    );
  }

  // =====================================================
  // ALERTAS POR MEDICAMENTO
  // =====================================================

  async deleteAlertsByMedicament(
    medicamentId: string
  ) {

    const user =
      await this.getUser();

    const alertsRef =
      ref(
        this.db,
        `users/${user.uid}/alerts`
      );

    return new Promise<void>((resolve) => {

      onValue(
        alertsRef,
        async snapshot => {

          const data = snapshot.val();

          if (!data) {
            resolve();
            return;
          }

          const promises: Promise<any>[] = [];

          Object.entries(data).forEach(
            ([key, value]: any) => {

              if (
                value.medicamentoId === medicamentId ||
                value.medicamentId === medicamentId
              ) {

                promises.push(
                  remove(
                    ref(
                      this.db,
                      `users/${user.uid}/alerts/${key}`
                    )
                  )
                );
              }
            }
          );

          await Promise.all(promises);

          resolve();

        },
        {
          onlyOnce: true
        }
      );
    });
  }

  async updateAlertsByMedicament(
    medicamentId: string,
    data: any
  ) {

    const user =
      await this.getUser();

    const alertsRef =
      ref(
        this.db,
        `users/${user.uid}/alerts`
      );

    return new Promise<void>((resolve) => {

      onValue(
        alertsRef,
        async snapshot => {

          const snapData =
            snapshot.val();

          if (!snapData) {
            resolve();
            return;
          }

          const promises: Promise<any>[] = [];

          Object.entries(snapData).forEach(
            ([key, value]: any) => {

              if (
                value.medicamentoId === medicamentId ||
                value.medicamentId === medicamentId
              ) {

                promises.push(

                  update(
                    ref(
                      this.db,
                      `users/${user.uid}/alerts/${key}`
                    ),
                    {
                      nombre:
                        data.nombre,

                      medicamentImageUrl:
                        data.medicamentImageUrl ||
                        data.imageUrl
                    }
                  )
                );
              }
            }
          );

          await Promise.all(promises);

          resolve();

        },
        {
          onlyOnce: true
        }
      );
    });
  }
}