# Loja de Jogos de Terror Retrô

Projeto desenvolvido para a disciplina de Programação Web Back-End do curso de
Análise e Desenvolvimento de Sistemas da UTFPR — Campus Cornélio Procópio.

A aplicação representa o catálogo de uma loja de jogos de terror com estética
retrô. O mesmo back-end utiliza PostgreSQL com Sequelize para os dados
relacionais e MongoDB com Mongoose para os documentos de avaliações.

## Integrantes

- Mikael André Ortiz Pelegrino — RA: 2767139
- Daniel Henrique Delmonico Cintra — RA: 2769018
- João Gabriel Marques de Miranda — RA: 2809001

## Tecnologias utilizadas

- Node.js;
- Express;
- PostgreSQL;
- Sequelize;
- MongoDB;
- Mongoose;
- JavaScript com orientação a objetos;
- HTML e CSS simples para o painel opcional de testes.

## Objetivo e funcionamento

O Node.js executa a aplicação e o Express cria o servidor e as rotas HTTP. A
aplicação recebe dados por `req.body`, `req.params` e `req.query`, valida esses
dados e utiliza duas formas de persistência:

```text
Node.js → Sequelize → PostgreSQL
Node.js → Mongoose  → MongoDB
```

O sistema possui operações de cadastro, consulta, atualização e exclusão, ou
seja, as quatro operações CRUD. Como o conteúdo trabalhado na disciplina exige
rotas GET e POST, as consultas utilizam GET e as alterações utilizam POST.

## Por que utilizar PostgreSQL e MongoDB?

### PostgreSQL

O PostgreSQL armazena `Categoria`, `Desenvolvedora` e `Jogo`. Esses dados têm
campos bem definidos e relacionamentos claros:

```text
Categoria      1 ───────── N Jogo
Desenvolvedora 1 ───────── N Jogo
```

Cada jogo pertence a uma categoria e a uma desenvolvedora. Por isso, o banco
relacional é adequado: ele organiza os dados em tabelas e mantém as ligações
por meio das chaves estrangeiras `categoriaId` e `desenvolvedoraId`.

### MongoDB

O MongoDB armazena as avaliações dos jogos. Uma avaliação faz sentido como
parte de um documento que contém uma lista variável de objetos:

```json
{
  "jogoId": 1,
  "avaliacoes": [
    {
      "usuario": "Ana",
      "nota": 5,
      "comentario": "Atmosfera excelente."
    },
    {
      "usuario": "Carlos",
      "nota": 4,
      "comentario": "Boa ambientação."
    }
  ]
}
```

O número de avaliações pode variar de um jogo para outro. O MongoDB permite
representar essa lista diretamente como um array de objetos aninhados dentro
do documento.

### Como os dois bancos pertencem ao mesmo sistema?

O campo `jogoId` do documento MongoDB corresponde ao `id` do jogo armazenado
no PostgreSQL. A integração não é apenas conceitual:

- antes de cadastrar avaliações, a aplicação verifica se o jogo existe no
  PostgreSQL;
- só pode existir um documento de avaliações para cada jogo;
- a exclusão de um jogo é impedida enquanto ele tiver avaliações no MongoDB;
- `GET /jogos/:id/detalhes` consulta os dois bancos e reúne os resultados em
  uma única resposta.

Assim, PostgreSQL e MongoDB fazem parte da mesma aplicação e da mesma temática,
e não representam dois sistemas independentes.

## Modelagem do PostgreSQL

### Categoria

| Campo | Tipo | Regra |
|---|---|---|
| `id` | INTEGER | chave primária e auto incremento |
| `nome` | STRING | obrigatório, entre 1 e 100 caracteres |
| `descricao` | TEXT | opcional, até 1000 caracteres |

### Desenvolvedora

| Campo | Tipo | Regra |
|---|---|---|
| `id` | INTEGER | chave primária e auto incremento |
| `nome` | STRING | obrigatório, entre 1 e 150 caracteres |
| `pais` | STRING | obrigatório, até 100 caracteres e deve possuir letras |
| `anoFundacao` | INTEGER | opcional, entre 1950 e o ano atual |

### Jogo

| Campo | Tipo | Regra |
|---|---|---|
| `id` | INTEGER | chave primária e auto incremento |
| `titulo` | STRING | obrigatório, entre 1 e 150 caracteres |
| `descricao` | TEXT | obrigatória, entre 1 e 2000 caracteres |
| `preco` | DOUBLE | obrigatório, entre 0 e 10000 |
| `anoLancamento` | INTEGER | obrigatório, entre 1970 e o próximo ano |
| `plataforma` | STRING | obrigatória, até 100 caracteres e deve possuir letras |
| `estoque` | INTEGER | obrigatório, entre 0 e 1000000 |
| `categoriaId` | INTEGER | chave estrangeira obrigatória e positiva |
| `desenvolvedoraId` | INTEGER | chave estrangeira obrigatória e positiva |

Os relacionamentos são declarados com `hasMany` e `belongsTo` no arquivo
`config/db.js`.

## Modelagem do MongoDB

O model `AvaliacoesJogo` possui:

| Campo | Tipo | Regra |
|---|---|---|
| `jogoId` | Number | obrigatório, positivo e deve existir no PostgreSQL |
| `avaliacoes` | Array | obrigatório e não pode estar vazio |
| `usuario` | String | obrigatório e até 100 caracteres |
| `nota` | Number | número inteiro entre 1 e 5 |
| `comentario` | String | obrigatório e até 1000 caracteres |

As regras são verificadas pela aplicação e também pelo schema do Mongoose.

## Orientação a objetos

A classe `JogoRetro`, localizada em `classes/JogoRetro.js`, representa os dados
recebidos para cadastrar ou atualizar um jogo. Ela possui:

- `constructor`: recebe os dados do jogo;
- `validar()`: verifica todos os campos e devolve os nomes dos campos inválidos;
- `paraObjeto()`: converte os valores válidos para o formato salvo pelo
  Sequelize.

As rotas utilizam a classe desta forma:

```javascript
const dadosJogo = new JogoRetro(req.body);
const camposInvalidos = dadosJogo.validar();
```

## Validação de dados

As validações são realizadas antes da persistência. Quando um dado é inválido,
a API devolve o status HTTP `400` e informa os campos incorretos.

Exemplos rejeitados:

- texto obrigatório vazio ou enviado como número;
- textos maiores que o limite permitido;
- preço negativo ou maior que 10000;
- ano de lançamento anterior a 1970 ou muito distante no futuro;
- ano de fundação anterior a 1950 ou posterior ao ano atual;
- estoque negativo, decimal ou maior que 1000000;
- plataforma ou país sem nenhuma letra;
- IDs vazios, negativos, decimais ou inexistentes;
- nota menor que 1, maior que 5 ou decimal;
- array de avaliações vazio;
- avaliação ligada a um jogo inexistente.

Um texto sem significado, como uma sequência aleatória de letras, ainda é um
texto tecnicamente válido. A aplicação verifica formato, tipo, tamanho e regras
de negócio, mas não tenta interpretar o significado daquilo que a pessoa
escreveu.

## Tratamento de erros e arquivo de log

As operações assíncronas das rotas estão protegidas por `try/catch`. Se uma
exceção inesperada acontecer, o `catch` chama `responderErro`, que:

1. envia o erro para a função `registrarErro`;
2. acrescenta data, contexto da rota e detalhes técnicos em `logs/errors.log`;
3. devolve status HTTP `500` com uma mensagem controlada;
4. evita expor a pilha completa do erro ao usuário.

Erros previstos utilizam respostas específicas:

- `400`: dados inválidos ou operação não permitida;
- `404`: registro não encontrado;
- `500`: exceção interna inesperada.

A conexão inicial também possui tratamento. Se PostgreSQL ou MongoDB estiver
indisponível, o servidor não inicia parcialmente e o problema é registrado no
log.

## Estrutura do projeto

```text
loja-jogos-terror-retro/
├── app.js
├── package.json
├── package-lock.json
├── README.md
├── classes/
│   └── JogoRetro.js
├── config/
│   ├── db.js
│   └── db_mongoose.js
├── models/
│   ├── categoria.js
│   ├── desenvolvedora.js
│   ├── jogo.js
│   └── avaliacoesJogo.js
├── rotas/
│   ├── categorias.js
│   ├── desenvolvedoras.js
│   ├── jogos.js
│   └── avaliacoes.js
├── utils/
│   ├── log.js
│   ├── responderErro.js
│   └── validacao.js
├── logs/
│   └── errors.log
├── public/
│   ├── index.html
│   └── estilo.css
├── TESTES.http
└── APRESENTACAO.http
```

O `app.js` configura o Express, registra as rotas, conecta os dois bancos e
inicia o servidor. As rotas foram separadas por assunto para manter o código
legível sem utilizar estruturas que não foram trabalhadas na disciplina.

## Pré-requisitos

Antes de executar, é necessário possuir:

- Node.js;
- PostgreSQL;
- MongoDB local ou MongoDB Atlas;
- banco PostgreSQL chamado `loja_terror_retro`.

## Configuração do PostgreSQL

Crie o banco no pgAdmin:

```sql
CREATE DATABASE loja_terror_retro;
```

Confira as informações em `config/db.js`:

```text
banco: loja_terror_retro
usuário: postgres
senha: 1234
host: localhost
```

Se a instalação utilizar outra senha, altere o arquivo antes de executar. O
`sequelize.sync()` cria as tabelas ausentes sem apagar os dados existentes.

## Configuração do MongoDB

Para utilizar o MongoDB local, inicie o serviço e mantenha em
`config/db_mongoose.js`:

```text
mongodb://localhost:27017/loja_terror_retro
```

Se for utilizado MongoDB Atlas, substitua temporariamente a conexão por uma
URI do cluster e nunca publique usuário ou senha reais no GitHub.

## Instalação e execução

No terminal, entre na pasta do projeto e execute:

```powershell
npm install
npm start
```

Quando as duas conexões funcionarem, o terminal mostrará:

```text
Servidor em http://localhost:8081
PostgreSQL e MongoDB conectados.
```

Endereços principais:

```text
API:    http://localhost:8081/
Painel: http://localhost:8081/painel
```

Para encerrar o servidor, pressione `Ctrl + C` no terminal que executa
`npm start`.

## Rotas da API

### Categorias — PostgreSQL

| Método | Rota | Operação |
|---|---|---|
| GET | `/categorias` | listar categorias |
| GET | `/categorias/:id` | localizar uma categoria |
| POST | `/categorias` | cadastrar uma categoria |
| POST | `/categorias/:id/atualizar` | atualizar uma categoria |
| POST | `/categorias/:id/excluir` | excluir uma categoria |

### Desenvolvedoras — PostgreSQL

| Método | Rota | Operação |
|---|---|---|
| GET | `/desenvolvedoras` | listar desenvolvedoras |
| GET | `/desenvolvedoras/:id` | localizar uma desenvolvedora |
| POST | `/desenvolvedoras` | cadastrar uma desenvolvedora |
| POST | `/desenvolvedoras/:id/atualizar` | atualizar uma desenvolvedora |
| POST | `/desenvolvedoras/:id/excluir` | excluir uma desenvolvedora |

### Jogos — PostgreSQL e integração

| Método | Rota | Operação |
|---|---|---|
| GET | `/jogos` | listar, filtrar, ordenar e paginar |
| GET | `/jogos/:id` | localizar um jogo |
| GET | `/jogos/:id/detalhes` | reunir PostgreSQL e MongoDB |
| POST | `/jogos` | cadastrar um jogo |
| POST | `/jogos/:id/atualizar` | atualizar um jogo |
| POST | `/jogos/:id/excluir` | excluir um jogo |

A rota de listagem aceita parâmetros de consulta:

```text
/jogos?titulo=Eco&categoriaId=1&ordenarPor=preco&ordem=DESC&pagina=1&limite=5
```

Ela utiliza `where`, `Op.like`, `order`, `offset` e `limit` do Sequelize.

### Avaliações — MongoDB

| Método | Rota | Operação |
|---|---|---|
| GET | `/avaliacoes` | listar todos os documentos |
| GET | `/avaliacoes?jogoId=1` | filtrar pelo jogo |
| GET | `/avaliacoes/:jogoId` | localizar pelo jogo |
| POST | `/avaliacoes` | cadastrar um documento |
| POST | `/avaliacoes/:jogoId/atualizar` | atualizar um documento |
| POST | `/avaliacoes/:jogoId/excluir` | excluir um documento |

## Métodos utilizados no CRUD

No Sequelize:

```text
create      → cadastrar
findAll     → listar e filtrar
findByPk    → localizar pelo ID
save        → salvar uma atualização
destroy     → excluir
```

No Mongoose:

```text
save              → cadastrar documento
find              → consultar documentos
findOneAndUpdate  → atualizar documento
findOneAndDelete  → excluir documento
```

## Testes

O arquivo `TESTES.http` contém a sequência completa do CRUD. Ele pode ser usado
com a extensão REST Client do VS Code. Também é possível testar pelo painel ou
pelos comandos PowerShell encontrados em `COMANDOS_TERMINAL_VSCODE.txt`.

Para uma apresentação curta, o arquivo `APRESENTACAO.http` reúne somente as
requisições essenciais.

## Interface visual

O painel HTML e CSS é apenas uma forma visual de enviar alguns formulários e
abrir consultas. A lógica principal permanece no back-end Express. O painel
não substitui as rotas, os models, as validações ou a persistência nos bancos.

## Observações

- PostgreSQL e MongoDB precisam estar em execução antes de `npm start`;
- não é necessário enviar a pasta `node_modules`;
- não execute `npm audit fix --force`, pois ele pode trocar versões importantes;
- não publique credenciais reais do MongoDB Atlas;
- atualizações e exclusões usam POST para permanecer dentro dos métodos
  trabalhados nos módulos da disciplina.
