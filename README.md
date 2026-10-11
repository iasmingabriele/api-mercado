# API de Produtos - Queries Visuais

API REST em **Java / Spring Boot** com banco **MongoDB Atlas** (NoSQL), seguindo a mesma proposta do trabalho FacisaFlix, e um frontend que mostra **visualmente** cada query e o caminho que ela percorre na arquitetura.

## Arquitetura

```mermaid
flowchart LR
    N["Navegador"] -->|"1. abre a pagina"| F["Frontend<br/>HTML / JS"]
    F -->|"2. GET /api/produtos/..."| C["Controller<br/>@RestController"]
    C -->|"3. chama"| S["Service<br/>@Service"]
    S -->|"4. chama"| R["Repository<br/>MongoRepository"]
    R -->|"5. consulta"| M[("MongoDB Atlas<br/>colecao produtos")]
    M -->|"6. documentos"| R
    R -->|"7. objetos Produto"| S
    S -->|"8. lista"| C
    C -->|"9. JSON + HTTP 200"| F
    F -->|"10. cards / tabela"| N
```

## Fluxo de uma query (exemplo: faixa de preco)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant C as Controller
    participant R as Repository
    participant M as MongoDB Atlas

    U->>F: Informa min=5 e max=10 e clica em Executar
    F->>C: GET /api/produtos/preco?min=5&max=10
    C->>R: findByPrecoBetween(5, 10)
    R->>M: db.produtos.find({ preco: { $gt: 5, $lt: 10 } })
    M-->>R: documentos encontrados
    R-->>C: List<Produto>
    C-->>F: 200 OK + JSON
    F-->>U: Cards, tabela e resumo de precos
```

## Modelo de dados (MongoDB)

```mermaid
erDiagram
    CATEGORIAS ||--o{ PRODUTOS : "categoriaId"
    CATEGORIAS {
        string id PK
        string nome
    }
    PRODUTOS {
        string id PK
        string nome
        string descricao
        double preco
        int quantidadeEstoque
        string categoriaId FK
    }
```

## Queries disponiveis

| Query | Rota | Equivalente no MongoDB |
|---|---|---|
| Listar todos | `GET /api/produtos` | `db.produtos.find({})` |
| Faixa de preco | `GET /api/produtos/preco?min=5&max=10` | `db.produtos.find({ preco: { $gt: 5, $lt: 10 } })` |
| Por nome | `GET /api/produtos/buscar?nome=suco` | `db.produtos.find({ nome: { $regex: "suco", $options: "i" } })` |
| Por categoria | `GET /api/produtos/categoria/{categoriaId}` | `db.produtos.find({ categoriaId: "..." })` |
| Mais caros que | `GET /api/produtos/mais-caros?valor=10` | `db.produtos.find({ preco: { $gt: 10 } })` |
| Estoque baixo | `GET /api/produtos/estoque-baixo?limite=10` | `db.produtos.find({ quantidadeEstoque: { $lt: 10 } })` |
| Por ID | `GET /api/produtos/{id}` | `db.produtos.findOne({ _id: ObjectId("...") })` |
| Categorias | `GET /api/categorias` | `db.categorias.find({})` |

> As queries de filtro (preco, nome, categoria, mais-caros, estoque-baixo) sao chamadas pelo Controller direto no Repository. Listar todos e buscar por ID passam pelo Service. O frontend visual mostra isso: o Service aparece tracejado quando e pulado.


## Como rodar

**Backend (Spring Boot 3.5 / Java 21)**

1. Defina a variavel de ambiente com a string de conexao do Atlas (nunca escreva a senha no codigo):
   - Windows (PowerShell): `$env:MONGODB_URI="mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/BANCO"`
   - Linux/Mac: `export MONGODB_URI="mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/BANCO"`
2. No `application.properties` use: `spring.data.mongodb.uri=${MONGODB_URI}`
3. Rode `./mvnw spring-boot:run` (ou o botao Run da IDE). O backend sobe em `http://localhost:8080`.

**Frontend Angular**

1. Na pasta do frontend: `npm install` e depois `ng serve`. Abre em `http://localhost:4200`.

**Frontend visual das queries**

1. Copie a pasta `frontend-visual` para dentro da pasta `public` do projeto Angular (`public/frontend-visual`).
2. Com o `ng serve` rodando, abra `http://localhost:4200/frontend-visual/index.html`. Assim a pagina usa a mesma origem (4200) que o CORS do backend ja libera.
3. Confira a **URL do backend** no topo (padrao `http://localhost:8080`).
4. Escolha uma query e clique em **Executar**: o fluxo anima as camadas, mostra a requisicao HTTP, o equivalente no MongoDB e o resultado em cards, tabela ou JSON.

## Seguranca

- `application.properties` com usuario e senha **nao deve ir para o GitHub**. Use variavel de ambiente (`MONGODB_URI`).
- Se uma senha ja foi commitada alguma vez, troque-a no Atlas (Database Access) e remova o acesso `0.0.0.0/0` em Network Access quando possivel.

## Tecnologias

Java 21 - Spring Boot 3.5 - Spring Data MongoDB - MongoDB Atlas - Angular - HTML/CSS/JS
