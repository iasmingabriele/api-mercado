package com.example.api_mercado.repository;

import com.example.api_mercado.entity.Categoria;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoriaRepository extends MongoRepository<Categoria, String> {
}