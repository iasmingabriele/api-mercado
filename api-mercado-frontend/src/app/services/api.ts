import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarCategorias(): Observable<any> { return this.http.get(`${this.baseUrl}/categorias`); }
  criarCategoria(dados: any): Observable<any> { return this.http.post(`${this.baseUrl}/categorias`, dados); }
  deletarCategoria(id: string): Observable<any> { return this.http.delete(`${this.baseUrl}/categorias/${id}`); }

  listarProdutos(): Observable<any> { return this.http.get(`${this.baseUrl}/produtos`); }
  criarProduto(dados: any): Observable<any> { return this.http.post(`${this.baseUrl}/produtos`, dados); }
  deletarProduto(id: string): Observable<any> { return this.http.delete(`${this.baseUrl}/produtos/${id}`); }
}