package com.example.api_mercado.controller;

import com.example.api_mercado.entity.Produto;
import com.example.api_mercado.repository.ProdutoRepository;
import com.example.api_mercado.service.ProdutoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;

    public ProdutoController(ProdutoService produtoService, ProdutoRepository produtoRepository) {
        this.produtoService = produtoService;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping
    public List<Produto> listarTodos() {
        return produtoService.listarTodos();
    }

    // ---------- QUERIES ----------

    // GET /api/produtos/buscar?nome=suco
    @GetMapping("/buscar")
    public List<Produto> buscarPorNome(@RequestParam String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome);
    }

    // GET /api/produtos/categoria/{categoriaId}
    @GetMapping("/categoria/{categoriaId}")
    public List<Produto> buscarPorCategoria(@PathVariable String categoriaId) {
        return produtoRepository.findByCategoriaId(categoriaId);
    }

    // GET /api/produtos/preco?min=5&max=10
    @GetMapping("/preco")
    public List<Produto> buscarPorFaixaDePreco(@RequestParam Double min, @RequestParam Double max) {
        return produtoRepository.findByPrecoBetween(min, max);
    }

    // GET /api/produtos/mais-caros?valor=10
    @GetMapping("/mais-caros")
    public List<Produto> buscarMaisCaros(@RequestParam Double valor) {
        return produtoRepository.buscarMaisCarosQue(valor);
    }

    // GET /api/produtos/estoque-baixo?limite=10
    @GetMapping("/estoque-baixo")
    public List<Produto> estoqueBaixo(@RequestParam Integer limite) {
        return produtoRepository.findByQuantidadeEstoqueLessThan(limite);
    }

    // ---------- CRUD ----------

    @GetMapping("/{id}")
    public Produto buscarPorId(@PathVariable String id) {
        return produtoService.buscarPorId(id);
    }

    @PostMapping
    public Produto criar(@RequestBody Produto produto) {
        return produtoService.criar(produto);
    }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable String id, @RequestBody Produto produto) {
        return produtoService.atualizar(id, produto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable String id) {
        produtoService.deletar(id);
    }
}