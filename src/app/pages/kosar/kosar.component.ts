import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KosarTetel } from '../../services/interfaces';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-kosar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './kosar.component.html',
  styleUrls: ['./kosar.component.css']
})
export class KosarComponent implements OnChanges {
  @Input() tetelek: KosarTetel[] = [];
  @Output() tetelTorles = new EventEmitter<number>();
  @Output() mennyisegValtozas = new EventEmitter<{ id: number; mennyiseg: number }>();
  @Output() rendelesTeljesites = new EventEmitter<KosarTetel[]>();
  
  kosarForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.kosarForm = this.createForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tetelek']) {
      this.updateFormItems();
    }
  }
  
  createForm(): FormGroup {
    return this.fb.group({
      tetelek: this.fb.array([])
    });
  }
  
  get tetelekArray(): FormArray {
    return this.kosarForm.get('tetelek') as FormArray;
  }
  
  updateFormItems(): void {
   
    while (this.tetelekArray.length) {
      this.tetelekArray.removeAt(0);
    }
    
   
    this.tetelek.forEach(tetel => {
      this.tetelekArray.push(
        this.fb.group({
          id: [tetel.id, Validators.required],
          nev: [tetel.nev, Validators.required],
          ar: [tetel.ar, Validators.required],
          mennyiseg: [tetel.mennyiseg, [Validators.required, Validators.min(1)]]
        })
      );
    });
  }
  
  tetelTorlese(id: number): void {
    this.tetelTorles.emit(id);
  }

  novelMennyiseg(index: number): void {
    const tetelForm = this.tetelekArray.at(index);
    const id = tetelForm.get('id')?.value;
    const currentQty = tetelForm.get('mennyiseg')?.value || 0;
    
    tetelForm.get('mennyiseg')?.setValue(currentQty + 1);
    this.mennyisegValtozas.emit({ id, mennyiseg: currentQty + 1 });
  }

  csokkentMennyiseg(index: number): void {
    const tetelForm = this.tetelekArray.at(index);
    const id = tetelForm.get('id')?.value;
    const currentQty = tetelForm.get('mennyiseg')?.value || 0;
    
    if (currentQty > 1) {
      tetelForm.get('mennyiseg')?.setValue(currentQty - 1);
      this.mennyisegValtozas.emit({ id, mennyiseg: currentQty - 1 });
    } else {
      this.tetelTorlese(id);
    }
  }

  submitOrder(): void {
    if (this.kosarForm.valid && this.tetelek.length > 0) {
     
      this.rendelesTeljesites.emit(this.tetelek);
    }
  }

  getOsszesen(): number {
    return this.tetelek.reduce((sum, item) => sum + (item.ar * item.mennyiseg), 0);
  }
}