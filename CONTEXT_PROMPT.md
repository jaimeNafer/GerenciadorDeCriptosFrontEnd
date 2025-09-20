# Contexto da Aplicação - Gerenciador de Criptomoedas

## Visão Geral do Projeto

Este é um sistema completo de gerenciamento de carteira de criptomoedas composto por:
- **Frontend**: Angular 20+ com Bootstrap 5 e TypeScript
- **Backend**: Spring Boot 3.2+ com Kotlin e JPA
- **Banco de Dados**: MySQL (produção) e H2 (desenvolvimento)

### Principal objetivo do sistema
Obter as operações e calcular lucro prejuizo, movimentações, preço médio para que seja possível emitir um relatório com todas as informações necessárias para declaração da IN1888.

### Telas desenvolvidas:
- Importação: Responsável por permitir a entrada de dados no sistema, através de arquivos csv e no futuro por integração com api das corretoras.
- Operações: Responsável por listar todas as operações obtidas na importação, já com os calculos de lucro prejuízo, quantiade de movimentações, e informações para IN1888.
- Carteira: Responsavel por apresentar  um consolidado dos dados obtidos nas operações, como lista de ativos com quantidade, preço médio, percentual de variação do preço. Tambem será nesta tela que teremos a evolução patrimonial, gráficos e paineis com dados consolidados para apoiar o investidor no entendimento de como está a saúde e andamento das suas operações.

### Telas para serem desenvolvidas:
- Tela de login: Será responsável por criar novos usuarios e permitir efetuar login no sistema.

## Arquitetura do Sistema

### Backend (Spring Boot + Kotlin)
**Localização**: `gerenciadorDeCripto/`

**Estrutura de Pacotes**:
```
br.com.nafer.gerenciadorcripto/
├── Main.kt                    # Classe principal da aplicação
├── application/               # Casos de uso e regras de negócio
├── clients/                   # Clientes para APIs externas
├── config/                    # Configurações do Spring
├── controllers/               # Controllers REST
├── domain/                    # Entidades de domínio
├── dtos/                      # Data Transfer Objects
├── exceptions/                # Tratamento de exceções
├── infrastructure/            # Infraestrutura (repositórios, etc.)
├── services/                  # Serviços de negócio
└── utils/                     # Utilitários
```

**Tecnologias Principais**:
- Spring Boot 3.2.5
- Kotlin 1.9.22 com JVM 21
- Spring Data JPA
- MySQL Connector
- MapStruct para mapeamento de DTOs
- Caffeine para cache
- OpenCSV para processamento de arquivos
- Swagger/OpenAPI para documentação

### Frontend (Angular + TypeScript)
**Localização**: `gerenciadorDeCripto-frontend/`

**Estrutura de Componentes**:
```
src/app/
├── components/
│   ├── ativos/               # Gestão de ativos
│   ├── carteira-form/        # Formulário de carteira
│   ├── file-upload/          # Upload de arquivos
│   ├── home/                 # Página inicial
│   ├── importacao/           # Importação de dados
│   └── operacoes/            # Gestão de operações
├── models/                   # Interfaces TypeScript
│   ├── ativo.model.ts
│   ├── operacao.model.ts
│   ├── carteira.model.ts
│   └── corretora.model.ts
└── services/                 # Serviços HTTP
    ├── ativo.service.ts
    ├── operacao.service.ts
    └── carteira.service.ts
```

**Tecnologias Principais**:
- Angular 20.2+
- Bootstrap 5.3.8 + Bootstrap Icons
- Chart.js e ECharts para gráficos
- RxJS para programação reativa
- SSR (Server-Side Rendering)

## Domínio da Aplicação

### Entidades Principais

1. **Ativo**: Representa uma criptomoeda na carteira
   - Quantidade total, preço médio, valor investido
   - Métricas de performance (lucro/prejuízo, variações)
   - Dados de mercado atualizados

2. **Operação**: Transações de compra/venda/transferência
   - Tipos: COMPRA, VENDA, TRANSFERENCIA, STAKING, REWARD, AIRDROP
   - Status: PENDENTE, CONFIRMADA, CANCELADA, ERRO
   - Dados da transação (quantidade, preço, taxas)

3. **Carteira**: Agrupamento de ativos por usuário
4. **Corretora**: Plataformas onde as operações são realizadas

### Funcionalidades Principais
- Gestão de carteiras de criptomoedas
- Registro e acompanhamento de operações
- Cálculo automático de métricas de performance
- Importação de dados via CSV
- Dashboards e relatórios visuais
- Consolidação mensal de resultados

## Padrões de Desenvolvimento Obrigatórios

### Clean Code e SOLID
- **Single Responsibility**: Cada classe/função deve ter uma única responsabilidade
- **Open/Closed**: Aberto para extensão, fechado para modificação
- **Liskov Substitution**: Subtipos devem ser substituíveis por seus tipos base
- **Interface Segregation**: Interfaces específicas são melhores que interfaces gerais
- **Dependency Inversion**: Dependa de abstrações, não de implementações concretas

### Arquitetura
- **Backend**: Arquitetura em camadas (Controller → Service → Repository)
- **Frontend**: Arquitetura baseada em componentes com separação clara de responsabilidades
- **Comunicação**: API REST com DTOs bem definidos
- **Tratamento de Erros**: Centralizado e consistente

### Padrões de Código

#### Backend (Kotlin)
```kotlin
// Exemplo de Controller bem estruturado
@RestController
@RequestMapping("/v1/ativos")
@CrossOrigin(origins = ["http://localhost:4200"])
class AtivosController(
    private val ativoService: AtivoService
) {
    @GetMapping
    fun listarAtivos(): ResponseEntity<List<AtivoDTO>> {
        return try {
            val ativos = ativoService.listarAtivos()
            ResponseEntity.ok(ativos)
        } catch (e: Exception) {
            ResponseEntity.internalServerError().build()
        }
    }
}
```

#### Frontend (Angular/TypeScript)
```typescript
// Exemplo de Service bem estruturado
@Injectable({
  providedIn: 'root'
})
export class AtivoService {
  private readonly apiUrl = 'http://localhost:8080/v1/ativos';

  constructor(private http: HttpClient) {}

  listarAtivos(): Observable<Ativo[]> {
    return this.http.get<Ativo[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Erro na requisição:', error);
    return throwError(() => error);
  }
}
```

## Padrão Visual e UX

### Paleta de Cores Padrão
```scss
// Cores principais
$primary-color: #2c3e50;      // Azul escuro (sidebar, headers)
$secondary-color: #3498db;     // Azul claro (destaques, bordas)
$background-color: #f8f9fa;    // Cinza claro (fundo)
$text-color: #333;             // Texto principal
$muted-color: #6c757d;         // Texto secundário
$white: #ffffff;               // Fundo de cards
$border-color: #34495e;        // Bordas da sidebar
```

### Componentes Visuais
- **Cards**: Fundo branco, border-radius 8px, sombra sutil
- **Sidebar**: Fundo #2c3e50, largura fixa 250px
- **Botões**: Seguir padrões do Bootstrap com cores customizadas
- **Formulários**: Validação visual clara, feedback imediato
- **Gráficos**: Cores consistentes com a paleta principal

### Responsividade
- Design mobile-first
- Breakpoints do Bootstrap
- Sidebar colapsável em telas menores

## Boas Práticas de Desenvolvimento

### Geral
1. **Código Simples**: Prefira soluções simples e diretas
2. **Nomenclatura**: Use nomes descritivos em português para domínio de negócio
3. **Comentários**: Apenas quando necessário, código deve ser autoexplicativo
4. **Testes**: Escreva testes unitários para lógica de negócio
5. **Versionamento**: Commits pequenos e descritivos

### Backend
1. **DTOs**: Sempre use DTOs para comunicação externa, nunca retorne entidades diretamente.
2. **Validação**: Use Bean Validation (@Valid, @NotNull, etc.)
3. **Transações**: Gerencie transações adequadamente
4. **Cache**: Use cache para dados que mudam pouco
5. **Logs**: Log estruturado com níveis apropriados
6. **Controllers: Mantenha as controllers sempre livres de regras de negócios, try-catch e logs.
7. **Mappers: Devem ser apenas para mapeamento entre entidades e DTOs, não pode conter regras de negócios.
8. **Comentários**: Evite comentários desnecessários, prefira nomes de variáveis e métodos descritivos.

### Frontend
1. **Componentes**: Pequenos, reutilizáveis e com responsabilidade única
2. **Services**: Centralize lógica de negócio e comunicação HTTP
3. **Observables**: Use RxJS adequadamente, evite memory leaks
4. **Formulários**: Use Reactive Forms com validação
5. **Performance**: Lazy loading, OnPush change detection quando apropriado

### Tratamento de Erros
- **Backend**: GlobalExceptionHandler centralizado
- **Frontend**: Interceptors para tratamento global de erros HTTP
- **UX**: Feedback claro para o usuário em caso de erro

## Estrutura de Dados

### Principais Interfaces (Frontend)
```typescript
interface Ativo {
  id?: number;
  criptomoeda: string;
  simbolo: string;
  quantidadeTotal: number;
  precoMedio: number;
  valorInvestido: number;
  precoAtual?: number;
  valorAtual?: number;
  lucroPreju?: number;
  percentualLucro?: number;
}

interface Operacao {
  id?: number;
  carteiraId: number;
  criptomoeda: string;
  simbolo: string;
  tipoOperacao: TipoOperacao;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  dataOperacao: Date;
  status: StatusOperacao;
}
```

## Comandos Úteis

### Backend
```bash
# Executar aplicação
./gradlew bootRun

# Executar testes
./gradlew test

# Build
./gradlew build
```

### Frontend
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test
```

## API Endpoints e Contratos

### Carteiras

#### Criar Carteira
```http
POST http://localhost:8080/v1/carteiras
Content-Type: application/json

{
  "nome": "Binace Test",
  "corretora": {
    "idCorretora": 1
  }
}
```

#### Listar Carteiras
```http
GET http://localhost:8080/v1/carteiras

Response:
[
  {
    "idCarteira": 45,
    "nome": "Binace Test",
    "excluido": false,
    "usuario": {
      "idUsuario": 1,
      "nome": "Jaime Ferreira do Nascimento"
    },
    "corretora": {
      "idCorretora": 3,
      "nome": "Quant Fury"
    }
  }
]
```

#### Deletar Carteira
```bash
curl -X 'DELETE' \
  'http://localhost:8080/v1/carteiras/{idCarteira}' \
  -H 'accept: */*'
```

### Corretoras

#### Listar Corretoras
```http
GET http://localhost:8080/v1/corretoras

Response:
[
  {
    "idCorretora": 1,
    "nome": "Binance"
  }
]
```

### Operações

#### Listar Operações de uma Carteira
```http
GET http://localhost:8080/v1/carteiras/{idCarteira}/operacoes

Response:
[
[
  {
    "mesAnoReferencia": "Maio/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 11,
      "valorTotalMovimentacoes": 0,
      "valorTotalCompras": -3000,
      "valorTotalVendas": 0,
      "valorTotalPermutas": 0,
      "valorTotalLucroPrejuizo": 0,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3065,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-05-26T21:56:36",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.880662",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3066,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-05-28T21:35:28",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.88422",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3067,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-05-29T18:42:09",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.88422",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3092,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-26T22:05:32",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 0.1167,
        "dataOperacaoSaida": "2024-05-26T22:05:32",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -100,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.970361",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3093,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-26T22:08:34",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 1.3372,
        "dataOperacaoSaida": "2024-05-26T22:08:34",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.981148",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3094,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-26T22:10:00",
        "moedaEntrada": {
          "ticker": "NEAR",
          "nome": "NEAR Protocol",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/10365/thumb/near.jpg"
        },
        "quantidadeEntrada": 7.2805,
        "dataOperacaoSaida": "2024-05-26T22:10:00",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -300,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.98632",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3095,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-26T22:22:36",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 8.8317,
        "dataOperacaoSaida": "2024-05-26T22:22:36",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.98632",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3096,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-27T01:26:05",
        "moedaEntrada": {
          "ticker": "ARKM",
          "nome": "Arkham",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/30929/thumb/Arkham_Logo_CG.png"
        },
        "quantidadeEntrada": 10.1995,
        "dataOperacaoSaida": "2024-05-27T01:26:05",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.98632",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3097,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-27T01:28:53",
        "moedaEntrada": {
          "ticker": "RONIN",
          "nome": "Ronin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/20009/thumb/photo_2024-04-06_22-52-24.jpg"
        },
        "quantidadeEntrada": 7.2685,
        "dataOperacaoSaida": "2024-05-27T01:28:53",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.996726",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3098,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-27T01:30:31",
        "moedaEntrada": {
          "ticker": "PYTH",
          "nome": "Pyth Network",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31924/thumb/pyth.png"
        },
        "quantidadeEntrada": 51.8421,
        "dataOperacaoSaida": "2024-05-27T01:30:31",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.996726",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3099,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-28T21:36:59",
        "moedaEntrada": {
          "ticker": "TIA",
          "nome": "Celestia",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31967/thumb/tia.jpg"
        },
        "quantidadeEntrada": 2.0247,
        "dataOperacaoSaida": "2024-05-28T21:36:59",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.00227",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3100,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-28T22:56:04",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 0.4514,
        "dataOperacaoSaida": "2024-05-28T22:56:04",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -400,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.00227",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3101,
        "finalidade": {
          "nome": "COMPRA_FIAT",
          "descricao": "Compra com Fiat"
        },
        "dataOperacaoEntrada": "2024-05-29T01:41:44",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 91.8445,
        "dataOperacaoSaida": "2024-05-29T01:41:44",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -480,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.00227",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3102,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-05-29T01:53:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -10,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.00227",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3103,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-05-29T02:09:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -81.8445,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.00227",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3104,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-05-29T22:41:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -5,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.018404",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3105,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-05-29T22:50:42",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -100,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.018404",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3106,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-05-29T22:53:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -85.8407,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.018404",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3118,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-05-29T22:28:50",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 190.8407,
        "dataOperacaoSaida": "2024-05-29T22:28:50",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.06637",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Junho/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 3,
      "valorTotalMovimentacoes": 479.028,
      "valorTotalCompras": -2000,
      "valorTotalVendas": 0,
      "valorTotalPermutas": 479.028,
      "valorTotalLucroPrejuizo": -48.9315,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3068,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-06-08T02:32:05",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.890044",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3069,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-06-09T22:01:07",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.890044",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3119,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-06-08T02:34:28",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 1.1391,
        "dataOperacaoSaida": "2024-06-08T02:34:28",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.080589",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3120,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-06-09T22:04:42",
        "moedaEntrada": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeEntrada": 0.2754,
        "dataOperacaoSaida": "2024-06-09T22:04:42",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.082112",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3121,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-06-11T10:54:01",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 0.573,
        "dataOperacaoSaida": "2024-06-11T10:54:01",
        "moedaSaida": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeSaida": -0.1454,
        "valorBrl": 479.028,
        "lucroPrejuizo": -48.9315,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.082112",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Julho/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 1,
      "valorTotalMovimentacoes": 0,
      "valorTotalCompras": -2000,
      "valorTotalVendas": 0,
      "valorTotalPermutas": 0,
      "valorTotalLucroPrejuizo": 0,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3070,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-07-08T21:49:59",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 2000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.890044",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3122,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-07-08T21:53:11",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 2.5799,
        "dataOperacaoSaida": "2024-07-08T21:53:11",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.082112",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Agosto/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 15,
      "valorTotalMovimentacoes": 0,
      "valorTotalCompras": -15000,
      "valorTotalVendas": 0,
      "valorTotalPermutas": 0,
      "valorTotalLucroPrejuizo": 0,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3071,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-08-05T01:35:44",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.890044",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3072,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-08-07T01:16:49",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.890044",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3073,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-08-07T01:44:19",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 1000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.906221",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3074,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-08-08T21:08:47",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 7000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.906221",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3075,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-08-16T13:53:47",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 5000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.906221",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3107,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-08-10T13:23:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -178.7747,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.02911",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3123,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-02T23:44:34",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 0.0001,
        "dataOperacaoSaida": "2024-08-02T23:44:34",
        "moedaSaida": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeSaida": 0,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.098247",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "ERRO"
      },
      {
        "idOperacao": 3124,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-05T01:38:11",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 1.2483,
        "dataOperacaoSaida": "2024-08-05T01:38:12",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.098247",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3125,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-07T01:24:00",
        "moedaEntrada": {
          "ticker": "NEAR",
          "nome": "NEAR Protocol",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/10365/thumb/near.jpg"
        },
        "quantidadeEntrada": 23.8928,
        "dataOperacaoSaida": "2024-08-07T01:24:01",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.098247",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3126,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-07T01:29:58",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 8.6696,
        "dataOperacaoSaida": "2024-08-07T01:29:58",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.108596",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3127,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-07T01:47:50",
        "moedaEntrada": {
          "ticker": "TIA",
          "nome": "Celestia",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31967/thumb/tia.jpg"
        },
        "quantidadeEntrada": 17.193,
        "dataOperacaoSaida": "2024-08-07T01:47:50",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.114235",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3128,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:11:20",
        "moedaEntrada": {
          "ticker": "NEAR",
          "nome": "NEAR Protocol",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/10365/thumb/near.jpg"
        },
        "quantidadeEntrada": 45.4542,
        "dataOperacaoSaida": "2024-08-08T21:11:20",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.114235",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3129,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:12:14",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 17.1714,
        "dataOperacaoSaida": "2024-08-08T21:12:14",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.114235",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3130,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:13:10",
        "moedaEntrada": {
          "ticker": "RONIN",
          "nome": "Ronin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/20009/thumb/photo_2024-04-06_22-52-24.jpg"
        },
        "quantidadeEntrada": 117.5315,
        "dataOperacaoSaida": "2024-08-08T21:13:10",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.114235",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3131,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:14:52",
        "moedaEntrada": {
          "ticker": "TIA",
          "nome": "Celestia",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31967/thumb/tia.jpg"
        },
        "quantidadeEntrada": 36.0092,
        "dataOperacaoSaida": "2024-08-08T21:14:52",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.114235",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3132,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:15:45",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 156.5148,
        "dataOperacaoSaida": "2024-08-08T21:15:45",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.130034",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3133,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:17:02",
        "moedaEntrada": {
          "ticker": "PYTH",
          "nome": "Pyth Network",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31924/thumb/pyth.png"
        },
        "quantidadeEntrada": 314.1212,
        "dataOperacaoSaida": "2024-08-08T21:17:02",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.130034",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3134,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-08T21:17:45",
        "moedaEntrada": {
          "ticker": "ARKM",
          "nome": "Arkham",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/30929/thumb/Arkham_Logo_CG.png"
        },
        "quantidadeEntrada": 86.0565,
        "dataOperacaoSaida": "2024-08-08T21:17:45",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.140752",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3135,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-10T12:46:09",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 178.7747,
        "dataOperacaoSaida": "2024-08-10T12:46:09",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.140752",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3136,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-11T22:30:12",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 88.1519,
        "dataOperacaoSaida": "2024-08-11T22:30:12",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.14618",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3137,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-08-16T15:34:21",
        "moedaEntrada": {
          "ticker": "BTC",
          "nome": "Bitcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
        },
        "quantidadeEntrada": 0.0157,
        "dataOperacaoSaida": "2024-08-16T15:34:21",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -5000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.14618",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Setembro/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 12,
      "valorTotalMovimentacoes": 0,
      "valorTotalCompras": -27000,
      "valorTotalVendas": 0,
      "valorTotalPermutas": 0,
      "valorTotalLucroPrejuizo": 0,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3076,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-09-05T21:32:15",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 5000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.91696",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3077,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-09-06T01:09:08",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 5000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.92226",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3078,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-09-16T16:20:40",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 5000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.92226",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3079,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-09-27T00:11:03",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 12000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.92226",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3138,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-05T21:33:33",
        "moedaEntrada": {
          "ticker": "BTC",
          "nome": "Bitcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
        },
        "quantidadeEntrada": 0.0079,
        "dataOperacaoSaida": "2024-09-05T21:33:34",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.14618",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3139,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-05T21:40:33",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 1.3771,
        "dataOperacaoSaida": "2024-09-05T21:40:33",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.14618",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3140,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-06T01:09:54",
        "moedaEntrada": {
          "ticker": "ETH",
          "nome": "Ethereum",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png"
        },
        "quantidadeEntrada": 0.3735,
        "dataOperacaoSaida": "2024-09-06T01:09:54",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -5000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.14618",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3141,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-06T01:16:32",
        "moedaEntrada": {
          "ticker": "TIA",
          "nome": "Celestia",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31967/thumb/tia.jpg"
        },
        "quantidadeEntrada": 30.5795,
        "dataOperacaoSaida": "2024-09-06T01:16:33",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -700,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.162402",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3142,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-06T01:20:09",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 72.9733,
        "dataOperacaoSaida": "2024-09-06T01:20:10",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -400,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.162402",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3143,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-06T01:25:20",
        "moedaEntrada": {
          "ticker": "NEAR",
          "nome": "NEAR Protocol",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/10365/thumb/near.jpg"
        },
        "quantidadeEntrada": 19.0109,
        "dataOperacaoSaida": "2024-09-06T01:25:20",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -400,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.162402",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3144,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-16T16:21:27",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 458.3149,
        "dataOperacaoSaida": "2024-09-16T16:21:28",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.181514",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3145,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-16T16:22:53",
        "moedaEntrada": {
          "ticker": "TIA",
          "nome": "Celestia",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31967/thumb/tia.jpg"
        },
        "quantidadeEntrada": 98.4669,
        "dataOperacaoSaida": "2024-09-16T16:22:54",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.19475",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3146,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-27T00:26:38",
        "moedaEntrada": {
          "ticker": "NEAR",
          "nome": "NEAR Protocol",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/10365/thumb/near.jpg"
        },
        "quantidadeEntrada": 98.6696,
        "dataOperacaoSaida": "2024-09-27T00:26:38",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -3000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.19475",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3147,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-27T00:27:57",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 58.1311,
        "dataOperacaoSaida": "2024-09-27T00:27:57",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -4000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.19475",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3148,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-27T00:28:52",
        "moedaEntrada": {
          "ticker": "RONIN",
          "nome": "Ronin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/20009/thumb/photo_2024-04-06_22-52-24.jpg"
        },
        "quantidadeEntrada": 290.9592,
        "dataOperacaoSaida": "2024-09-27T00:28:53",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -3000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.19475",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3149,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-09-27T00:29:28",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 2.3437,
        "dataOperacaoSaida": "2024-09-27T00:29:29",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.21314",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Outubro/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 6,
      "valorTotalMovimentacoes": 0,
      "valorTotalCompras": -20000,
      "valorTotalVendas": 0,
      "valorTotalPermutas": 0,
      "valorTotalLucroPrejuizo": 0,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3080,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-10-04T11:58:50",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 10000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.92226",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3081,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-10-04T17:38:30",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 10000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.92226",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3150,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-10-04T12:01:07",
        "moedaEntrada": {
          "ticker": "PYTH",
          "nome": "Pyth Network",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31924/thumb/pyth.png"
        },
        "quantidadeEntrada": 2460.0619,
        "dataOperacaoSaida": "2024-10-04T12:01:08",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -4300,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.217171",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3151,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-10-04T12:05:11",
        "moedaEntrada": {
          "ticker": "ARKM",
          "nome": "Arkham",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/30929/thumb/Arkham_Logo_CG.png"
        },
        "quantidadeEntrada": 571.69,
        "dataOperacaoSaida": "2024-10-04T12:05:11",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -4280,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.221195",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3152,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-10-04T12:06:39",
        "moedaEntrada": {
          "ticker": "RONIN",
          "nome": "Ronin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/20009/thumb/photo_2024-04-06_22-52-24.jpg"
        },
        "quantidadeEntrada": 142.2522,
        "dataOperacaoSaida": "2024-10-04T12:06:40",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1270,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.221195",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3153,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-10-04T12:07:34",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 26.8502,
        "dataOperacaoSaida": "2024-10-04T12:07:35",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -150,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.22717",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3154,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-10-04T17:40:02",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 12.6902,
        "dataOperacaoSaida": "2024-10-04T17:40:03",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -10000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.22717",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3155,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-10-31T18:13:32",
        "moedaEntrada": {
          "ticker": "STX",
          "nome": "Stacks",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/2069/thumb/Stacks_Logo_png.png"
        },
        "quantidadeEntrada": 0.0165,
        "dataOperacaoSaida": "2024-10-31T18:13:33",
        "moedaSaida": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeSaida": 0,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.22717",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Novembro/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 43,
      "valorTotalMovimentacoes": 20771.9067,
      "valorTotalCompras": -76879.9413,
      "valorTotalVendas": 11559.9413,
      "valorTotalPermutas": 20771.9067,
      "valorTotalLucroPrejuizo": 4598.6855,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3082,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-01T14:21:55",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 10000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.938391",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3083,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-01T14:23:13",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 8000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.938391",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3084,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-15T01:05:49",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 10000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.938391",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3085,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-18T18:43:17",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 10000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.938391",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3086,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-18T18:45:53",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 11000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.938391",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3087,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-19T02:21:14",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 8320,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.954288",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3088,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-11-21T12:05:49",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 8000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.954288",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3108,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-11-01T21:10:42",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -1197.3858,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.02911",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3109,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-11-15T02:56:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -357.9327,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.034317",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3110,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-11-19T03:40:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -893.4965,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.034317",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3111,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-11-23T22:53:41",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -580.0943,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.034317",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3116,
        "finalidade": {
          "nome": "TRANSFERENCIA",
          "descricao": "Transferencia"
        },
        "dataOperacaoEntrada": "2024-11-19T03:29:04",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 0.001,
        "dataOperacaoSaida": "2024-11-19T03:29:05",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": -0.001,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.06637",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3117,
        "finalidade": {
          "nome": "TRANSFERENCIA",
          "descricao": "Transferencia"
        },
        "dataOperacaoEntrada": "2024-11-19T03:32:10",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 0,
        "dataOperacaoSaida": "2024-11-19T03:32:11",
        "moedaSaida": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeSaida": 0,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.06637",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3156,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:28:13",
        "moedaEntrada": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeEntrada": 1.4764,
        "dataOperacaoSaida": "2024-11-01T16:28:14",
        "moedaSaida": {
          "ticker": "TIA",
          "nome": "Celestia",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31967/thumb/tia.jpg"
        },
        "quantidadeSaida": -184.2733,
        "valorBrl": 4985.1176,
        "lucroPrejuizo": 145.5759,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.22717",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3157,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:30:04",
        "moedaEntrada": {
          "ticker": "STX",
          "nome": "Stacks",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/2069/thumb/Stacks_Logo_png.png"
        },
        "quantidadeEntrada": 266.2361,
        "dataOperacaoSaida": "2024-11-01T16:30:05",
        "moedaSaida": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeSaida": -0.75,
        "valorBrl": 2523,
        "lucroPrejuizo": -41.1675,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.242963",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3158,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:30:59",
        "moedaEntrada": {
          "ticker": "MKR",
          "nome": "MKR",
          "descricao": null,
          "icone": null
        },
        "quantidadeEntrada": 0.3241,
        "dataOperacaoSaida": "2024-11-01T16:30:59",
        "moedaSaida": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeSaida": -0.7264,
        "valorBrl": 2443.6096,
        "lucroPrejuizo": -41.6518,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.242963",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3159,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:33:16",
        "moedaEntrada": {
          "ticker": "TON",
          "nome": "Toncoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/17980/thumb/photo_2024-09-10_17.09.00.jpeg"
        },
        "quantidadeEntrada": 105.7669,
        "dataOperacaoSaida": "2024-11-01T16:33:17",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -3060,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.242963",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3160,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:34:15",
        "moedaEntrada": {
          "ticker": "WLD",
          "nome": "Worldcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31069/thumb/worldcoin.jpeg"
        },
        "quantidadeEntrada": 202.7539,
        "dataOperacaoSaida": "2024-11-01T16:34:16",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2288,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.242963",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3161,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:35:27",
        "moedaEntrada": {
          "ticker": "ENA",
          "nome": "Ethena",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/36530/thumb/ethena.png"
        },
        "quantidadeEntrada": 1044.221,
        "dataOperacaoSaida": "2024-11-01T16:35:28",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2280,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.25336",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3162,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:36:39",
        "moedaEntrada": {
          "ticker": "ETHFI",
          "nome": "Ether.fi",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/35958/thumb/etherfi.jpeg"
        },
        "quantidadeEntrada": 275.9498,
        "dataOperacaoSaida": "2024-11-01T16:36:40",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2288,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.25336",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3163,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:39:34",
        "moedaEntrada": {
          "ticker": "STX",
          "nome": "Stacks",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/2069/thumb/Stacks_Logo_png.png"
        },
        "quantidadeEntrada": 52.8886,
        "dataOperacaoSaida": "2024-11-01T16:39:34",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.259153",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3164,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T16:41:51",
        "moedaEntrada": {
          "ticker": "MKR",
          "nome": "MKR",
          "descricao": null,
          "icone": null
        },
        "quantidadeEntrada": 0.0666,
        "dataOperacaoSaida": "2024-11-01T16:41:52",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.263167",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3165,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-01T21:05:42",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 1197.3858,
        "dataOperacaoSaida": "2024-11-01T21:05:42",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -7084,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.265172",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3166,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:02:15",
        "moedaEntrada": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeEntrada": 1233.9305,
        "dataOperacaoSaida": "2024-11-15T02:02:16",
        "moedaSaida": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeSaida": -5.9,
        "valorBrl": 7243.43,
        "lucroPrejuizo": 2491.629,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.269181",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3167,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:08:48",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 31.8748,
        "dataOperacaoSaida": "2024-11-15T02:08:48",
        "moedaSaida": {
          "ticker": "ARKM",
          "nome": "Arkham",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/30929/thumb/Arkham_Logo_CG.png"
        },
        "quantidadeSaida": -210.638,
        "valorBrl": 2438.7409,
        "lucroPrejuizo": 893.1051,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.271187",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3168,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:21:57",
        "moedaEntrada": {
          "ticker": "ETHFI",
          "nome": "Ether.fi",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/35958/thumb/etherfi.jpeg"
        },
        "quantidadeEntrada": 0.1289,
        "dataOperacaoSaida": "2024-11-15T02:21:58",
        "moedaSaida": {
          "ticker": "PYTH",
          "nome": "Pyth Network",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31924/thumb/pyth.png"
        },
        "quantidadeSaida": -0.4916,
        "valorBrl": 1.1255,
        "lucroPrejuizo": 0.2605,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.271187",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3169,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:28:12",
        "moedaEntrada": {
          "ticker": "ETHFI",
          "nome": "Ether.fi",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/35958/thumb/etherfi.jpeg"
        },
        "quantidadeEntrada": 130.5983,
        "dataOperacaoSaida": "2024-11-15T02:28:12",
        "moedaSaida": {
          "ticker": "PYTH",
          "nome": "Pyth Network",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31924/thumb/pyth.png"
        },
        "quantidadeSaida": -496.57,
        "valorBrl": 1136.8831,
        "lucroPrejuizo": 263.1821,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.275342",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3170,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:34:31",
        "moedaEntrada": {
          "ticker": "STX",
          "nome": "Stacks",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/2069/thumb/Stacks_Logo_png.png"
        },
        "quantidadeEntrada": 178.7666,
        "dataOperacaoSaida": "2024-11-15T02:34:32",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1900,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.275342",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3171,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:41:19",
        "moedaEntrada": {
          "ticker": "TON",
          "nome": "Toncoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/17980/thumb/photo_2024-09-10_17.09.00.jpeg"
        },
        "quantidadeEntrada": 64.3679,
        "dataOperacaoSaida": "2024-11-15T02:41:20",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.281791",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3172,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:42:37",
        "moedaEntrada": {
          "ticker": "WLD",
          "nome": "Worldcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31069/thumb/worldcoin.jpeg"
        },
        "quantidadeEntrada": 69.5112,
        "dataOperacaoSaida": "2024-11-15T02:42:37",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -900,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.281791",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3173,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:44:07",
        "moedaEntrada": {
          "ticker": "ENA",
          "nome": "Ethena",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/36530/thumb/ethena.png"
        },
        "quantidadeEntrada": 94.8484,
        "dataOperacaoSaida": "2024-11-15T02:44:08",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -300,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.291108",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3174,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:46:03",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 18.3268,
        "dataOperacaoSaida": "2024-11-15T02:46:04",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -120,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.291108",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3175,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T02:49:49",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 357.9327,
        "dataOperacaoSaida": "2024-11-15T02:49:50",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2100,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.291108",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3176,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-15T03:03:20",
        "moedaEntrada": {
          "ticker": "MKR",
          "nome": "MKR",
          "descricao": null,
          "icone": null
        },
        "quantidadeEntrada": 0.2382,
        "dataOperacaoSaida": "2024-11-15T03:03:20",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.291108",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3177,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:00:31",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 2203.6448,
        "dataOperacaoSaida": "2024-11-19T03:00:31",
        "moedaSaida": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeSaida": -1.5878,
        "valorBrl": 0,
        "lucroPrejuizo": 935.9922,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.291108",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "VENDA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3178,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:07:11",
        "moedaEntrada": {
          "ticker": "ETH",
          "nome": "Ethereum",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png"
        },
        "quantidadeEntrada": 0.6492,
        "dataOperacaoSaida": "2024-11-19T03:07:11",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -11950,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.307246",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3179,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:08:53",
        "moedaEntrada": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeEntrada": 558.2359,
        "dataOperacaoSaida": "2024-11-19T03:08:53",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -3250,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.307246",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3180,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:11:20",
        "moedaEntrada": {
          "ticker": "WLD",
          "nome": "Worldcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31069/thumb/worldcoin.jpeg"
        },
        "quantidadeEntrada": 180.5464,
        "dataOperacaoSaida": "2024-11-19T03:11:21",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.307246",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3181,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:12:15",
        "moedaEntrada": {
          "ticker": "RONIN",
          "nome": "Ronin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/20009/thumb/photo_2024-04-06_22-52-24.jpg"
        },
        "quantidadeEntrada": 169.6934,
        "dataOperacaoSaida": "2024-11-19T03:12:15",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1450,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.307246",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3182,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:14:04",
        "moedaEntrada": {
          "ticker": "ENA",
          "nome": "Ethena",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/36530/thumb/ethena.png"
        },
        "quantidadeEntrada": 763.8915,
        "dataOperacaoSaida": "2024-11-19T03:14:05",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.323385",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3183,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:15:35",
        "moedaEntrada": {
          "ticker": "ETHFI",
          "nome": "Ether.fi",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/35958/thumb/etherfi.jpeg"
        },
        "quantidadeEntrada": 245.984,
        "dataOperacaoSaida": "2024-11-19T03:15:36",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -2350,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.323385",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3184,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:17:13",
        "moedaEntrada": {
          "ticker": "TON",
          "nome": "Toncoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/17980/thumb/photo_2024-09-10_17.09.00.jpeg"
        },
        "quantidadeEntrada": 21.3301,
        "dataOperacaoSaida": "2024-11-19T03:17:14",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -700,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.339526",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3185,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:18:35",
        "moedaEntrada": {
          "ticker": "MKR",
          "nome": "MKR",
          "descricao": null,
          "icone": null
        },
        "quantidadeEntrada": 0.0739,
        "dataOperacaoSaida": "2024-11-19T03:18:35",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -650,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.339526",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3186,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:19:59",
        "moedaEntrada": {
          "ticker": "LDO",
          "nome": "Lido DAO",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/13573/thumb/Lido_DAO.png"
        },
        "quantidadeEntrada": 56.5978,
        "dataOperacaoSaida": "2024-11-19T03:20:00",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -400,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.339526",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3187,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:20:57",
        "moedaEntrada": {
          "ticker": "STX",
          "nome": "Stacks",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/2069/thumb/Stacks_Logo_png.png"
        },
        "quantidadeEntrada": 62.5231,
        "dataOperacaoSaida": "2024-11-19T03:20:58",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -700,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.339526",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3188,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:26:11",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 893.4955,
        "dataOperacaoSaida": "2024-11-19T03:26:11",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -5200,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.339526",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3189,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-19T03:35:19",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 2.6226,
        "dataOperacaoSaida": "2024-11-19T03:35:20",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -230,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.3556",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3190,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-21T12:10:03",
        "moedaEntrada": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeEntrada": 1425.2459,
        "dataOperacaoSaida": "2024-11-21T12:10:04",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -8323.6448,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.3556",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3191,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:28:57",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 9356.2965,
        "dataOperacaoSaida": "2024-11-23T22:28:57",
        "moedaSaida": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeSaida": -1608,
        "valorBrl": 0,
        "lucroPrejuizo": -48.24,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.3556",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "VENDA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3192,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:30:06",
        "moedaEntrada": {
          "ticker": "BTC",
          "nome": "Bitcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
        },
        "quantidadeEntrada": 0.0052,
        "dataOperacaoSaida": "2024-11-23T22:30:06",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -3000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.366341",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3193,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:39:51",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 0.1332,
        "dataOperacaoSaida": "2024-11-23T22:39:51",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -200,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.371378",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3194,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:42:22",
        "moedaEntrada": {
          "ticker": "LINK",
          "nome": "Chainlink",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
        },
        "quantidadeEntrada": 1.948,
        "dataOperacaoSaida": "2024-11-23T22:42:23",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -200,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.371378",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3195,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:43:46",
        "moedaEntrada": {
          "ticker": "STX",
          "nome": "Stacks",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/2069/thumb/Stacks_Logo_png.png"
        },
        "quantidadeEntrada": 61.0279,
        "dataOperacaoSaida": "2024-11-23T22:43:46",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -740,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.371378",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3196,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:44:58",
        "moedaEntrada": {
          "ticker": "WLD",
          "nome": "Worldcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/31069/thumb/worldcoin.jpeg"
        },
        "quantidadeEntrada": 83.3249,
        "dataOperacaoSaida": "2024-11-23T22:44:59",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1200,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.381968",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3197,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:48:46",
        "moedaEntrada": {
          "ticker": "MKR",
          "nome": "MKR",
          "descricao": null,
          "icone": null
        },
        "quantidadeEntrada": 0.0614,
        "dataOperacaoSaida": "2024-11-23T22:48:47",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -600,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.381968",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3198,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-11-23T22:50:36",
        "moedaEntrada": {
          "ticker": "USDT",
          "nome": "Tether",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
        },
        "quantidadeEntrada": 580.0943,
        "dataOperacaoSaida": "2024-11-23T22:50:36",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -3416.2965,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.387219",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  },
  {
    "mesAnoReferencia": "Dezembro/2024",
    "consolidado": {
      "numeroTotalMovimentacoes": 9,
      "valorTotalMovimentacoes": 335.5491,
      "valorTotalCompras": -40005,
      "valorTotalVendas": 9480.2935,
      "valorTotalPermutas": 335.5491,
      "valorTotalLucroPrejuizo": 400.1766,
      "deveDeclararIN1888": false
    },
    "operacoes": [
      {
        "idOperacao": 3089,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-12-26T13:08:46",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 20000,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.954288",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3090,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-12-26T13:23:03",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 20005,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.970361",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3091,
        "finalidade": {
          "nome": "DEPOSITO",
          "descricao": "Deposito"
        },
        "dataOperacaoEntrada": "2024-12-29T11:50:01",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 10,
        "dataOperacaoSaida": null,
        "moedaSaida": null,
        "quantidadeSaida": null,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:57.970361",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3112,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-12-19T19:03:41",
        "moedaSaida": {
          "ticker": "ETH",
          "nome": "Ethereum",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png"
        },
        "quantidadeSaida": -0.02,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.034317",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3113,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-12-19T19:11:42",
        "moedaSaida": {
          "ticker": "ETH",
          "nome": "Ethereum",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png"
        },
        "quantidadeSaida": -0.03,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.050263",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3114,
        "finalidade": {
          "nome": "SAQUE",
          "descricao": "Saque"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-12-19T19:42:41",
        "moedaSaida": {
          "ticker": "POL",
          "nome": "POL (ex-MATIC)",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/32440/thumb/polygon.png"
        },
        "quantidadeSaida": -113.4224,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.050263",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3115,
        "finalidade": {
          "nome": "SAQUE_FIAT",
          "descricao": "Saque com Fiat"
        },
        "dataOperacaoEntrada": null,
        "moedaEntrada": null,
        "quantidadeEntrada": null,
        "dataOperacaoSaida": "2024-12-10T02:09:42",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -9480.29,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.050263",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "OUTROS",
        "statusOperacao": "PENDENTE"
      },
      {
        "idOperacao": 3199,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-10T02:04:53",
        "moedaEntrada": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeEntrada": 9480.2935,
        "dataOperacaoSaida": "2024-12-10T02:04:53",
        "moedaSaida": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeSaida": -1555,
        "valorBrl": 0,
        "lucroPrejuizo": 388.75,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.387219",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "VENDA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3200,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-19T19:17:43",
        "moedaEntrada": {
          "ticker": "POL",
          "nome": "POL (ex-MATIC)",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/32440/thumb/polygon.png"
        },
        "quantidadeEntrada": 113.3825,
        "dataOperacaoSaida": "2024-12-19T19:17:43",
        "moedaSaida": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeSaida": -54.4124,
        "valorBrl": 335.5491,
        "lucroPrejuizo": 11.4266,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.387219",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3201,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-19T19:24:33",
        "moedaEntrada": {
          "ticker": "POL",
          "nome": "POL (ex-MATIC)",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/32440/thumb/polygon.png"
        },
        "quantidadeEntrada": 0.0399,
        "dataOperacaoSaida": "2024-12-19T19:24:34",
        "moedaSaida": {
          "ticker": "BNB",
          "nome": "BNB",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
        },
        "quantidadeSaida": 0,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.387219",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "PERMUTA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3202,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-26T13:15:53",
        "moedaEntrada": {
          "ticker": "BTC",
          "nome": "Bitcoin",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
        },
        "quantidadeEntrada": 0.0109,
        "dataOperacaoSaida": "2024-12-26T13:15:54",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -6500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.387219",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3203,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-26T13:17:04",
        "moedaEntrada": {
          "ticker": "ETH",
          "nome": "Ethereum",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png"
        },
        "quantidadeEntrada": 0.2855,
        "dataOperacaoSaida": "2024-12-26T13:17:05",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -6000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.403308",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3204,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-26T13:18:36",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 6.331,
        "dataOperacaoSaida": "2024-12-26T13:18:36",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -7500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.403308",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3205,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-26T13:24:06",
        "moedaEntrada": {
          "ticker": "SOL",
          "nome": "Solana",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
        },
        "quantidadeEntrada": 3.373,
        "dataOperacaoSaida": "2024-12-26T13:24:07",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -4000,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.403308",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3206,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-26T13:32:02",
        "moedaEntrada": {
          "ticker": "USDC",
          "nome": "USDC",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/6319/thumb/usdc.png"
        },
        "quantidadeEntrada": 2315.4103,
        "dataOperacaoSaida": "2024-12-26T13:32:03",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -14500,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.403308",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      },
      {
        "idOperacao": 3207,
        "finalidade": {
          "nome": "CONVERSAO",
          "descricao": "Conversao"
        },
        "dataOperacaoEntrada": "2024-12-26T13:41:30",
        "moedaEntrada": {
          "ticker": "NEAR",
          "nome": "NEAR Protocol",
          "descricao": null,
          "icone": "https://coin-images.coingecko.com/coins/images/10365/thumb/near.jpg"
        },
        "quantidadeEntrada": 47.4218,
        "dataOperacaoSaida": "2024-12-26T13:41:31",
        "moedaSaida": {
          "ticker": "BRL",
          "nome": "Real",
          "descricao": "Moeda fiduciária brasileira",
          "icone": ""
        },
        "quantidadeSaida": -1505,
        "valorBrl": 0,
        "lucroPrejuizo": 0,
        "destino": null,
        "taxaQuantidade": null,
        "taxaMoeda": null,
        "taxaValorBrl": null,
        "dataCriacao": "2025-09-07T20:37:58.418985",
        "origemRegistro": "ARQUIVO",
        "observacao": null,
        "tipoOperacao": "COMPRA",
        "statusOperacao": "PROCESSADA"
      }
    ]
  }
]
```

### Arquivos

#### Listar Arquivos de uma Carteira
```http
GET http://localhost:8080/v1/carteiras/{idCarteira}/arquivos

Response:
[
  {
    "idArquivo": 11,
    "nome": "file",
    "carteira": {
      "idCarteira": 43,
      "nome": "Jaime Binance"
    }
  }
]
```

#### Criar Arquivo (Upload)
```bash
curl -X 'POST' \
  'http://localhost:8080/v1/carteiras/43/arquivos?separador=%3B' \
  -H 'accept: */*' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@binance.csv;type=text/csv'
```

**Response:**
```json
{
  "idArquivo": 0,
  "nome": "string",
  "status": "PENDENTE",
  "tamanhoBytes": 1000,
  "carteira": {
    "idCarteira": 1,
    "nome": "string"
  }
}
```

#### Deletar Arquivo
```bash
curl -X 'DELETE' \
  'http://localhost:8080/v1/carteiras/23/arquivos/1' \
  -H 'accept: */*'
```

#### Verificar Status do Processamento
```http
GET http://localhost:8080/v1/carteiras/{idCarteira}/arquivos/{idArquivo}/status

Response:
{
  "status": "PROCESSADO"
}
```

**Status Possíveis:**
- `PENDENTE`: Arquivo enviado, aguardando processamento
- `PROCESSANDO`: Arquivo sendo processado no momento
- `PROCESSADO`: Processamento concluído com sucesso
- `ERRO`: Erro durante o processamento

## Diretrizes para IA

Ao trabalhar neste projeto:

1. **Mantenha a Consistência**: Siga os padrões já estabelecidos
2. **Arquitetura Simples**: Não complique desnecessariamente
3. **Clean Code**: Código limpo e bem estruturado sempre
4. **Padrão Visual**: Mantenha a paleta de cores e componentes visuais
5. **Documentação**: Documente APIs e componentes complexos
6. **Performance**: Considere performance em todas as implementações
7. **Segurança**: Valide dados de entrada e trate erros adequadamente
8. **Testes**: Escreva testes para funcionalidades críticas
9. **API Contracts**: Siga rigorosamente os contratos de API documentados acima
10. **Atuação exclusiva no frontend**: Não altere o back end, apenas leia o código para aquisição e contexto, você é um especialista no frontend.

Lembre-se: **Simplicidade, clareza e manutenibilidade são prioridades máximas.**