// src/app/services/transporte.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Unidad {
  id: number;
  placa: string;
  chofer: string;
  capacidad: number;
}

export interface Ruta {
  id: number;
  origen: string;
  destino: string;
  unidad_id: number;
  unidad?: Unidad;
}

export interface RutaCompleta extends Ruta {
  distancia_km: number | null;
  duracion_horas: number | null;
}

export interface Distancia {
  origen: string;
  destino: string;
  distancia_km: number;
  duracion_horas: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransporteService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Obtener todas las unidades
  getUnidades(): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(`${this.apiUrl}/unidades`);
  }

  // Obtener todas las rutas (con datos de unidad incluidos)
  getRutas(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/rutas`);
  }

  // Obtener rutas completas (con distancia y duración) - USA TU ENDPOINT ESPECIAL
  getRutasCompletas(): Observable<RutaCompleta[]> {
    return this.http.get<RutaCompleta[]>(`${this.apiUrl}/rutas-completas`);
  }

  // Agregar una nueva ruta
  agregarRuta(ruta: { origen: string; destino: string; unidad_id: number }): Observable<Ruta> {
    return this.http.post<Ruta>(`${this.apiUrl}/rutas`, ruta);
  }

  // Obtener distancia entre dos ciudades
  getDistancia(origen: string, destino: string): Observable<Distancia> {
    return this.http.get<Distancia>(`${this.apiUrl}/distancia`, {
      params: { origen, destino }
    });
  }

  // Método alternativo: Combinar rutas con distancias usando RxJS (forkJoin + switchMap)
  getRutasConDistanciasManual(): Observable<RutaCompleta[]> {
    return this.getRutas().pipe(
      switchMap(rutas => {
        // Para cada ruta, hacer una petición de distancia
        const requests = rutas.map(ruta =>
          this.getDistancia(ruta.origen, ruta.destino).pipe(
            map(distancia => ({
              ...ruta,
              distancia_km: distancia.distancia_km,
              duracion_horas: distancia.duracion_horas
            }))
          )
        );
        
        // forkJoin espera a que todas las peticiones terminen
        return forkJoin(requests);
      })
    );
  }
}