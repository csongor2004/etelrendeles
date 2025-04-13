import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Etel } from '../../services/interfaces';

@Component({
  standalone: true,
  selector: 'app-modositas',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modositas.component.html',
  styleUrl: './modositas.component.css'
})
export class ModositasComponent {
  etelForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private snackBar: MatSnackBar
  ) {
    this.etelForm = this.fb.group({
      nev: ['', [Validators.required]],
      ar: ['', [Validators.required, Validators.min(1)]],
      kep: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.etelForm.invalid) {
      this.snackBar.open('Kérjük töltse ki az összes mezőt helyesen!', 'OK', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    try {
      // Get the next ID by counting the number of documents in the collection
      const etelek = collection(this.firestore, 'etelek');
      const etelek_snapshot = await addDoc(etelek, {
        nev: this.etelForm.value.nev,
        ar: Number(this.etelForm.value.ar),
        kep: this.etelForm.value.kep,
        id: Date.now() // Using timestamp as ID to ensure uniqueness
      });

      this.snackBar.open('Étel sikeresen hozzáadva!', 'OK', { duration: 3000 });
      this.etelForm.reset();
    } catch (error) {
      console.error('Hiba az étel hozzáadásakor:', error);
      this.snackBar.open('Hiba az étel hozzáadásakor', 'OK', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }
}