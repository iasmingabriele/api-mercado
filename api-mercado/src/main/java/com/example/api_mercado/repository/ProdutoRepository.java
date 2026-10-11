package com.example.api_mercado.repository;

import com.example.api_mercado.entity.Produto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ProdutoRepository extends MongoRepository<Produto, String> {

    // busca por parte do nome, sem diferenciar maiúscula/minúscula
    List<Produto> findByNomeContainingIgnoreCase(String nome);

    // todos os produtos de uma categoria
    List<Produto> findByCategoriaId(String categoriaId);

    // faixa de preço
    List<Produto> findByPrecoBetween(Double min, Double max);

    // mais baratos que um valor
    List<Produto> findByPrecoLessThan(Double preco);

    // estoque baixo
    List<Produto> findByQuantidadeEstoqueLessThan(Integer quantidade);

    // produtos mais caros que um valor (query manual do Mongo)
    @Query("{ 'preco': { $gt: ?0 } }")
    List<Produto> buscarMaisCarosQue(Double preco);
}