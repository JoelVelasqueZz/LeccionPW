// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransporteService, Unidad, RutaCompleta } from './services/transporte';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = '🚚 Sistema de Gestión de Rutas de Transporte';
  
  rutasCompletas: RutaCompleta[] = [];
  unidades: Unidad[] = [];
  rutaForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private transporteService: TransporteService,
    private fb: FormBuilder
  ) {
    // Inicializar el formulario reactivo
    this.rutaForm = this.fb.group({
      origen: ['', [Validators.required, Validators.minLength(3)]],
      destino: ['', [Validators.required, Validators.minLength(3)]],
      unidad_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar rutas y unidades
  cargarDatos(): void {
    this.loading = true;
    this.error = null;

    // Cargar unidades para el select
    this.transporteService.getUnidades().subscribe({
      next: (unidades) => {
        this.unidades = unidades;
      },
      error: (err) => {
        console.error('Error al cargar unidades:', err);
        this.error = 'Error al cargar las unidades';
      }
    });

    // Cargar rutas completas (con distancia y duración)
    this.transporteService.getRutasCompletas().subscribe({
      next: (rutas) => {
        this.rutasCompletas = rutas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        this.error = 'Error al cargar las rutas';
        this.loading = false;
      }
    });
  }

  // Enviar formulario
  onSubmit(): void {
    if (this.rutaForm.invalid) {
      this.error = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const nuevaRuta = {
      origen: this.rutaForm.value.origen,
      destino: this.rutaForm.value.destino,
      unidad_id: parseInt(this.rutaForm.value.unidad_id)
    };

    this.transporteService.agregarRuta(nuevaRuta).subscribe({
      next: (ruta) => {
        this.successMessage = `✅ Ruta creada exitosamente: ${ruta.origen} → ${ruta.destino}`;
        this.rutaForm.reset();
        this.cargarDatos(); // Recargar la tabla
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Error al crear ruta:', err);
        this.error = err.error?.error || 'Error al crear la ruta';
        this.loading = false;
      }
    });
  }

  // Obtener control del formulario
  get f() {
    return this.rutaForm.controls;
  }

  // Verificar si un campo es inválido y ha sido tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rutaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}