<h1 align="center"> Open Data API Validator </h1>

## 📝 Descrição

Este repositório consiste na implementação de uma ferramenta para validação de APIs de dados abertos do OpenFinance. A validação é realizada com base nos arquivos YAML disponibilizados pela documentação oficial das APIs.

## 📥 Requisitos

1. Instale o [Node.JS](https://nodejs.org/en/download/).
2. Utilize um editor de texto, como [Visual Studio Code](https://code.visualstudio.com/), para navegar e editar o projeto.
3. Tenha o Git instalado para clonar o repositório.

## 🧩 Como executar

1. Clone o repositório em sua máquina:

   ```bash
   git clone https://github.com/IagoCB/open-data.git
   ```

   ou

   ```bash
   git clone git@github.com:IagoCB/open-data.git
   ```

2. Acesse o diretório do projeto:

   ```bash
   cd open-data
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Execute o projeto em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse a documentação da API através do endereço:
   ```
   http://localhost:3000/api-docs
   ```

## 🚀 Estrutura do Projeto

    src/
    ├── app.js             # Arquivo principal da aplicação
    ├── routes/            # Rotas da API
    ├── service/           # Serviços responsáveis pela validação
    ├── schemas/           # Schemas JSON e YAML utilizados para validação
    └── controllers/       # Controladores responsáveis por processar as requisições, invocar os serviços necessários e retornar as respostas apropriadas.

    tests/                 # Testes unitários

## 📚 Dependências

### **Dependências principais**

- **express**  
  Framework minimalista e flexível para construção de aplicações web e APIs.

- **js-yaml**  
  Biblioteca para manipulação e parsing de arquivos YAML.

- **json-schema-ref-parser**  
  Ferramenta para resolver referências `$ref` em schemas JSON, permitindo a validação de schemas complexos.

- **node-fetch**  
  Implementação de `fetch` para Node.js, usada para realizar requisições HTTP.

- **swagger-ui-express**  
  Middleware que integra o Swagger UI com aplicativos Express para exibir a documentação de APIs.

### **Dependências de desenvolvimento**

- **jest**  
  Framework de testes JavaScript completo, usado para realizar testes unitários e de integração.

- **nodemon**  
  Ferramenta que monitora alterações nos arquivos do projeto e reinicia automaticamente o servidor durante o desenvolvimento.

- **supertest**  
  Biblioteca para realizar testes HTTP, geralmente usada em conjunto com o Jest para testar endpoints de APIs.

## 🔍 Testes

Os testes são realizados utilizando o framework **Jest**, garantindo a qualidade do código e a confiabilidade das validações.

### Executar todos os testes:

```bash
npm test
```

### Cobertura de testes:

Ao rodar os testes, um relatório de cobertura é gerado automaticamente. Ele pode ser encontrado no diretório coverage/.
