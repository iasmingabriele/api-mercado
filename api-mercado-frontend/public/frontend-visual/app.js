/* =====================================================================
   Queries visuais - API de Produtos
   ---------------------------------------------------------------------
   COMO ADAPTAR: so mexa na lista QUERIES logo abaixo.
   - caminho: rota do seu Controller. {algo} vira parametro de caminho.
   - params:  campos que aparecem na tela. Se o nome NAO esta no caminho
              como {nome}, ele vai na query string (?nome=valor).
   - mongo:   texto que mostra o equivalente no MongoDB.
   Dica: o caminho tambem pode ser editado direto na tela, sem recarregar.
   ===================================================================== */

const QUERIES = [
  {
    id: 'todos',
    titulo: 'Listar todos os produtos',
    descricao: 'produtoService.listarTodos() - traz tudo da colecao produtos.',
    caminho: '/api/produtos',
    params: [],
    mongo: () => 'db.produtos.find({})',
    camada: 'listarTodos()'
  },
  {
    id: 'preco',
    titulo: 'Produtos por faixa de preco',
    descricao: 'Preco entre min e max (extremos nao entram).',
    caminho: '/api/produtos/preco',
    params: [
      { nome: 'min', label: 'Preco minimo', tipo: 'number', valor: 5 },
      { nome: 'max', label: 'Preco maximo', tipo: 'number', valor: 10 }
    ],
    mongo: (p) => `db.produtos.find({\n  preco: { $gt: ${p.min}, $lt: ${p.max} }\n})`,
    camada: 'findByPrecoBetween(min, max)',
    pula: [3]
  },
  {
    id: 'buscar',
    titulo: 'Buscar produto por nome',
    descricao: 'Busca parcial, sem diferenciar maiusculas.',
    caminho: '/api/produtos/buscar',
    params: [{ nome: 'nome', label: 'Nome contem', tipo: 'text', valor: 'suco' }],
    mongo: (p) => `db.produtos.find({\n  nome: { $regex: "${p.nome}", $options: "i" }\n})`,
    camada: 'findByNomeContainingIgnoreCase(nome)',
    pula: [3]
  },
  {
    id: 'categoria',
    titulo: 'Produtos de uma categoria',
    descricao: 'Filtra pelo categoriaId.',
    caminho: '/api/produtos/categoria/{categoriaId}',
    params: [{ nome: 'categoriaId', label: 'ID da categoria', tipo: 'text', valor: '6acace8affd67a8166af6cfd' }],
    mongo: (p) => `db.produtos.find({\n  categoriaId: "${p.categoriaId}"\n})`,
    camada: 'findByCategoriaId(categoriaId)',
    pula: [3]
  },
  {
    id: 'maiscaros',
    titulo: 'Produtos mais caros que um valor',
    descricao: 'Preco maior que o valor informado.',
    caminho: '/api/produtos/mais-caros',
    params: [{ nome: 'valor', label: 'Valor', tipo: 'number', valor: 10 }],
    mongo: (p) => `db.produtos.find({\n  preco: { $gt: ${p.valor} }\n})`,
    camada: 'buscarMaisCarosQue(valor)',
    pula: [3]
  },
  {
    id: 'estoque',
    titulo: 'Produtos com estoque baixo',
    descricao: 'Quantidade em estoque menor que o limite.',
    caminho: '/api/produtos/estoque-baixo',
    params: [{ nome: 'limite', label: 'Limite de estoque', tipo: 'number', valor: 10 }],
    mongo: (p) => `db.produtos.find({\n  quantidadeEstoque: { $lt: ${p.limite} }\n})`,
    camada: 'findByQuantidadeEstoqueLessThan(limite)',
    pula: [3]
  },
  {
    id: 'id',
    titulo: 'Buscar produto por ID',
    descricao: 'produtoService.buscarPorId() - um unico documento.',
    caminho: '/api/produtos/{id}',
    params: [{ nome: 'id', label: 'ID do produto', tipo: 'text', valor: '6acad198ffd67a8166af6cfe' }],
    mongo: (p) => `db.produtos.findOne({\n  _id: ObjectId("${p.id}")\n})`,
    camada: 'buscarPorId(id)'
  },
  {
    id: 'categorias',
    titulo: 'Listar categorias',
    descricao: 'categoriaService.listarTodas() - colecao categorias.',
    caminho: '/api/categorias',
    params: [],
    mongo: () => 'db.categorias.find({})',
    camada: 'listarTodas()'
  }
];

/* Camadas do backend, na ordem em que a requisicao passa por elas */
const CAMADAS = [
  { icone: '🖥️', nome: 'Navegador', papel: 'Voce clica em Executar',
    ida: 'O navegador monta a requisicao HTTP e dispara um fetch().',
    volta: 'O navegador recebe o JSON e desenha a tela.' },
  { icone: '🎨', nome: 'Frontend', papel: 'Esta pagina (HTML/JS)',
    ida: 'O frontend le os campos, monta a URL e envia para o backend.',
    volta: 'O frontend transforma o JSON em cards, tabela e resumo.' },
  { icone: '🚪', nome: 'Controller', papel: '@RestController',
    ida: 'O Controller recebe a rota, le os parametros e chama o Service.',
    volta: 'O Controller devolve ResponseEntity com status 200 e o JSON.' },
  { icone: '⚙️', nome: 'Service', papel: '@Service',
    ida: 'O Service aplica as regras de negocio e chama o Repository.',
    volta: 'O Service repassa a lista de produtos ao Controller.' },
  { icone: '🗂️', nome: 'Repository', papel: 'MongoRepository',
    ida: 'O Repository traduz o metodo em uma consulta MongoDB.',
    volta: 'O Repository converte os documentos em objetos Produto.' },
  { icone: '🍃', nome: 'MongoDB Atlas', papel: 'colecao produtos', mongo: true,
    ida: 'O Atlas executa a consulta na colecao e encontra os documentos.',
    volta: 'O Atlas devolve os documentos encontrados.' }
];

const $ = (id) => document.getElementById(id);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const estado = { dados: [], aba: 'cards', ocupado: false, executou: false };

/* ---------------------------------------------------------------- util */
function el(tag, props = {}, filhos = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  for (const f of [].concat(filhos)) e.append(f);
  return e;
}

const moeda = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const base = () => $('baseUrl').value.trim().replace(/\/+$/, '');

function montarUrl(query, caixa) {
  let caminho = caixa.querySelector('.caminho').value.trim();
  const qs = new URLSearchParams();
  const valores = {};
  caixa.querySelectorAll('.campo input').forEach((inp) => {
    valores[inp.dataset.nome] = inp.value.trim();
  });
  for (const [nome, valor] of Object.entries(valores)) {
    const marcador = `{${nome}}`;
    if (caminho.includes(marcador)) caminho = caminho.replace(marcador, encodeURIComponent(valor));
    else if (valor !== '') qs.set(nome, valor);
  }
  const texto = qs.toString();
  return { url: base() + caminho + (texto ? '?' + texto : ''), caminho: caminho + (texto ? '?' + texto : ''), valores };
}

/* ------------------------------------------------------------ catalogo */
function desenharCatalogo() {
  const raiz = $('catalogo');
  QUERIES.forEach((q, i) => {
    const caixa = el('div', { class: 'query' + (i === 0 ? ' query--ativa' : ''), 'data-id': q.id });
    caixa.append(el('h4', {}, [el('span', { class: 'metodo', text: 'GET' }), q.titulo]));
    caixa.append(el('p', { text: q.descricao }));

    caixa.append(el('input', { class: 'caminho', value: q.caminho, 'aria-label': 'Caminho da rota' }));

    const campos = el('div', { class: 'campos' });
    q.params.forEach((p) => {
      const inp = el('input', { type: p.tipo, value: p.valor, 'data-nome': p.nome, step: 'any' });
      campos.append(el('div', { class: 'campo' }, [el('label', { text: p.label }), inp]));
    });
    caixa.append(campos);

    const btn = el('button', { class: 'btn', type: 'button', text: 'Executar' });
    btn.addEventListener('click', () => { caixa.click(); executar(q, caixa, btn); });
    caixa.append(btn);

    caixa.addEventListener('click', () => {
      raiz.querySelectorAll('.query').forEach((c) => c.classList.remove('query--ativa'));
      caixa.classList.add('query--ativa');
    });
    raiz.append(caixa);
  });
}

/* --------------------------------------------------------------- fluxo */
function desenharFluxo() {
  const raiz = $('fluxo');
  raiz.replaceChildren();
  CAMADAS.forEach((c, i) => {
    raiz.append(el('div', { class: 'no' + (c.mongo ? ' no--mongo' : ''), 'data-i': i }, [
      el('div', { class: 'icone', text: c.icone }),
      el('div', { class: 'nome', text: c.nome }),
      el('div', { class: 'papel', text: c.papel })
    ]));
    if (i < CAMADAS.length - 1) raiz.append(el('div', { class: 'seta', 'data-s': i, text: '➜' }));
  });
}

function marcarNo(i, classe) { raiz_no(i).classList.add(classe); }
function raiz_no(i) { return document.querySelector(`.no[data-i="${i}"]`); }
function limparFluxo() {
  document.querySelectorAll('.no').forEach((n) => n.classList.remove('no--ativo', 'no--volta', 'no--erro', 'no--pulado'));
  document.querySelectorAll('.seta').forEach((s) => { s.classList.remove('seta--ativa', 'seta--volta'); s.textContent = '➜'; });
}

async function animarIda(controle, pula) {
  for (let i = 0; i < CAMADAS.length; i++) {
    if (controle.parar) return;
    if (i > 0) { const s = document.querySelector(`.seta[data-s="${i - 1}"]`); s.classList.add('seta--ativa'); }
    if (pula.includes(i)) {
      marcarNo(i, 'no--pulado');
      $('fluxoTexto').textContent = `${i + 1}/${CAMADAS.length} - ${CAMADAS[i].nome}: nao participa desta query. O Controller chama o Repository direto.`;
      await dormir(300);
      continue;
    }
    marcarNo(i, 'no--ativo');
    $('fluxoTexto').textContent = `${i + 1}/${CAMADAS.length} - ${CAMADAS[i].nome}: ${CAMADAS[i].ida}`;
    await dormir(380);
  }
}

async function animarVolta(pula) {
  for (let i = CAMADAS.length - 1; i >= 0; i--) {
    if (pula.includes(i)) continue;
    const n = raiz_no(i);
    n.classList.remove('no--ativo');
    n.classList.add('no--volta');
    if (i > 0) { const s = document.querySelector(`.seta[data-s="${i - 1}"]`); s.classList.remove('seta--ativa'); s.classList.add('seta--volta'); s.textContent = '⬅'; }
    $('fluxoTexto').textContent = `Volta - ${CAMADAS[i].nome}: ${CAMADAS[i].volta}`;
    await dormir(200);
  }
  document.querySelectorAll('.seta--ativa').forEach((x) => { x.classList.remove('seta--ativa'); x.classList.add('seta--volta'); x.textContent = '\u2B05'; });
}

/* ------------------------------------------------------------ executar */
async function executar(query, caixa, btn) {
  if (estado.ocupado) return;
  estado.ocupado = true;
  btn.disabled = true;

  const { url, caminho, valores } = montarUrl(query, caixa);
  $('reqHttp').textContent = `GET ${caminho} HTTP/1.1\nHost: ${new URL(url).host}\nAccept: application/json`;
  $('reqMongo').textContent = query.mongo(valores);

  limparFluxo();
  const controle = { parar: false };
  const inicio = performance.now();
  const animacao = animarIda(controle, query.pula || []);

  let dados = null, erro = null, status = null;
  try {
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    status = resp.status;
    if (!resp.ok) throw new Error(`O backend respondeu HTTP ${resp.status}`);
    const texto = await resp.text();
    dados = texto ? JSON.parse(texto) : [];
  } catch (e) {
    erro = e;
  }
  const ms = Math.round(performance.now() - inicio);

  if (erro) {
    estado.executou = false;
    controle.parar = true;
    await animacao;
    limparFluxo();
    marcarNo(0, 'no--volta'); marcarNo(1, 'no--volta');
    marcarNo(2, 'no--erro');
    const rede = status === null;
    $('fluxoTexto').textContent = rede
      ? 'Falhou antes de chegar no Controller: backend desligado, URL errada ou CORS bloqueando.'
      : `O Controller respondeu com erro (HTTP ${status}). Veja o console do Spring Boot.`;
    mostrarErro(rede
      ? `Nao consegui falar com ${base()}. Confira se o Spring Boot esta rodando e se o CORS libera esta origem. (${erro.message})`
      : erro.message);
  } else {
    await animacao;
    await animarVolta(query.pula || []);
    $('fluxoTexto').textContent = `Concluido em ${ms} ms - HTTP ${status}. ${Array.isArray(dados) ? dados.length : 1} documento(s) retornado(s) por ${query.camada}.`;
    estado.dados = Array.isArray(dados) ? dados : (dados ? [dados] : []);
    estado.executou = true;
    renderizar();
  }

  btn.disabled = false;
  estado.ocupado = false;
}

/* ----------------------------------------------------------- resultado */
function mostrarErro(msg) {
  $('resumo').replaceChildren();
  $('saida').replaceChildren(el('div', { class: 'erro', text: msg }));
}

function renderizar() {
  const dados = estado.dados;
  const precos = dados.map((d) => Number(d.preco)).filter((n) => !Number.isNaN(n));

  const resumo = $('resumo');
  resumo.replaceChildren();
  const stat = (v, l) => el('div', { class: 'stat' }, [el('b', { text: v }), el('span', { text: l })]);
  resumo.append(stat(String(dados.length), 'documentos'));
  if (precos.length) {
    resumo.append(stat(moeda(Math.min(...precos)), 'menor preco'));
    resumo.append(stat(moeda(Math.max(...precos)), 'maior preco'));
    resumo.append(stat(moeda(precos.reduce((a, b) => a + b, 0) / precos.length), 'preco medio'));
  }

  const saida = $('saida');
  saida.replaceChildren();
  if (!dados.length) { saida.append(el('p', { class: 'vazio', text: 'A query rodou, mas nenhum documento foi encontrado.' })); return; }

  if (estado.aba === 'json') {
    saida.append(el('pre', { class: 'codigo', text: JSON.stringify(dados, null, 2) }));
  } else if (estado.aba === 'tabela') {
    const cols = [...new Set(dados.flatMap((d) => Object.keys(d)))];
    const tabela = el('table', {}, [
      el('thead', {}, [el('tr', {}, cols.map((c) => el('th', { text: c })))]),
      el('tbody', {}, dados.map((d) => el('tr', {}, cols.map((c) => el('td', { text: d[c] ?? '' })))))
    ]);
    saida.append(el('div', { class: 'tabela-wrap' }, [tabela]));
  } else {
    const maior = Math.max(...precos, 1);
    const grade = el('div', { class: 'grade' });
    dados.forEach((d) => {
      const preco = Number(d.preco);
      const baixo = Number(d.quantidadeEstoque) <= 5;
      grade.append(el('div', { class: 'card' }, [
        el('h4', { text: d.nome ?? '(sem nome)' }),
        el('p', { class: 'desc', text: d.descricao ?? '' }),
        el('div', { class: 'preco', text: Number.isNaN(preco) ? '-' : moeda(preco) }),
        el('div', { class: 'barra' }, [el('i', { style: `width:${Number.isNaN(preco) ? 0 : Math.round((preco / maior) * 100)}%` })]),
        el('div', { class: 'meta' }, [
          el('span', { class: 'tag' + (baixo ? ' tag--baixo' : ''), text: `estoque: ${d.quantidadeEstoque ?? '-'}` }),
          el('span', { class: 'tag', text: `categoria: ${String(d.categoriaId ?? '-').slice(-6)}` }),
          el('span', { class: 'tag', text: `id: ${String(d.id ?? '-').slice(-6)}` })
        ])
      ]));
    });
    saida.append(grade);
  }
}

/* -------------------------------------------------------------- status */
async function verificarStatus() {
  const s = $('status');
  try {
    await fetch(base() + '/api/produtos', { method: 'GET' });
    s.textContent = 'backend online';
    s.className = 'status status--on';
  } catch {
    s.textContent = 'backend offline';
    s.className = 'status status--off';
  }
}

/* ---------------------------------------------------------------- init */
desenharCatalogo();
desenharFluxo();
verificarStatus();
$('baseUrl').addEventListener('change', verificarStatus);
document.querySelectorAll('.aba').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.aba').forEach((x) => x.classList.remove('aba--ativa'));
  b.classList.add('aba--ativa');
  estado.aba = b.dataset.aba;
  if (estado.executou) renderizar();
}));
