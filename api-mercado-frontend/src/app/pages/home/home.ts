import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  categorias: any[] = [];
  produtos: any[] = [];

  novaCategoria = { nome: '', descricao: '' };
  novoProduto = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0, categoriaId: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregarCategorias();
    this.carregarProdutos();
  }

 carregarCategorias() {
  this.api.listarCategorias().subscribe(dados => this.categorias = dados);
}

  carregarProdutos() {
    this.api.listarProdutos().subscribe(dados => this.produtos = dados);
  }

  salvarCategoria() {
    this.api.criarCategoria(this.novaCategoria).subscribe(() => {
      this.novaCategoria = { nome: '', descricao: '' };
      this.carregarCategorias();
    });
  }

  removerCategoria(id: string) {
    this.api.deletarCategoria(id).subscribe(() => this.carregarCategorias());
  }

  salvarProduto() {
    this.api.criarProduto(this.novoProduto).subscribe(() => {
      this.novoProduto = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0, categoriaId: '' };
      this.carregarProdutos();
    });
  }

  removerProduto(id: string) {
    this.api.deletarProduto(id).subscribe(() => this.carregarProdutos());
  }
}