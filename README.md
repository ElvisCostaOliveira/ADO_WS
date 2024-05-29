# Projeto Final de Desenvolvimento de Web Services 

## Integrantes

- Elvis Oliveira
- Carlos Hardman
- Matheus Oliveira 
- Anthony Stapf

## Tema: Controle Financeiro(Biblioteca de registros financeiros)


Este projeto inclui uma biblioteca para gerenciar pendências e ganhos financeiros. A biblioteca permite:

- Cadastrar novos Usuarios.
- Logar Usuarios.
- Registrar entradas e saídas de valores.
- Consultar o saldo atual.
- Gerenciar histórico de transações.
- Dashboard transacional. 

### Funcionalidades Principais

1. **Registrar Entrada**: Permite registrar ganhos financeiros.
2. **Registrar Saída**: Permite registrar despesas.
3. **Consultar Saldo**: Exibe o saldo atual baseado nas entradas e saídas registradas.
4. **Histórico de Transações**: Mantém um registro detalhado de todas as transações realizadas.


## Explicação da Conexão Front-End com a API
### Axios

Axios é uma biblioteca de cliente HTTP baseada em Promises, que facilita fazer requisições HTTP (GET, POST, etc.) a partir do navegador.

### Exemplo de Requisição GET



 Utilizando o arquivo home.js como exemplo, Na linha 14(atualmente) existe o : ```axios.get('/receber')``` Que envia uma requisição GET para o endpoint /get-transactions do servidor.
 Dentro dessa estrutura do Axios, usamos o método ```.then``` para tratar a resposta e processar os dados retornados, e o método ```.catch``` para tratar possíveis erros na requisição.
 ## exemplo completo:
 ```javascript
    axios.get('/receber')
        .then(response => {
            const data = response.data;
            console.log(data);

            // Gráfico de Contas a Pagar
            const ctxPagar = document.getElementById('chartPagar').getContext('2d');
            const chartPagar = new Chart(ctxPagar, {
                type: 'pie',
                data: {
                    labels: ['Total em Dia', 'Total Vencido', 'Total Pago'],
                    datasets: [{
                        label: 'Total a Pagar R$',
                        data: [totalDentroDoPrazo, totalVencido, totalPagos],
                        backgroundColor: ['green', 'red', 'blue']
                    }]
                }
            });
            // Gráfico de Contas a Receber
            const totalPago = parseFloat(localStorage.getItem('totalPago')) || 0;
            const totalAReceber = parseFloat(localStorage.getItem('totalAReceber')) || 0;

            const ctxReceber = document.getElementById('chartReceber').getContext('2d');
            const chartReceber = new Chart(ctxReceber, {
                type: 'pie',
                data: {
                    labels: ['Total Pago', 'Total a Receber'],
                    datasets: [{
                        label: 'Total a Receber R$',
                        data: [totalPago, totalAReceber],
                        backgroundColor: ['yellow', 'purple']
                    }]
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar transações:', error);
        });


```

### Chart.js

Apenas para contextualizar esse mesmo exemplo, Chart.js é uma biblioteca JavaScript que permite criar gráficos interativos e animados em páginas web.

Neste script, dois gráficos de pizza são criados para visualizar os dados de contas a pagar e a receber.


## Rotas e Explicações de cada
### todas rotas estão no arquivo ```index.js```

###  `/registro`

```javascript
app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'registro.html')));
```
- Método: GET
- Descrição: Serve a página de registro para o usuário.
- Arquivo Servido: `public/registro.html`


### `/login`
```javascript
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
```

- Método: GET
- Descrição: Serve a página de login para o usuário.
- Arquivo Servido: `public/login.html`

### `/registro`

```javascript
app.post('/registro', async (req, res) => { ... });
```

- Método: POST
- Descrição: Registra um novo usuário, verificando se o email já está cadastrado. Se não estiver, cria um novo usuário com a senha criptografada e armazena no arquivo `usuario.json`.
- Ações: Criação de novo usuário, hash da senha, atualização de sessão e redirecionamento para `/pagar`.


### `/login`
```javascript
app.post('/login', async (req, res) => { ... });
```

- Método: POST
- Descrição: Autentica um usuário existente. Verifica as credenciais e, se válidas, cria uma sessão e redireciona para `/pagar`.
- Ações: Autenticação do usuário, configuração de cookies e redirecionamento.

### `/pagar`

```javascript
app.get('/pagar', (req, res) => { ... });
```

- Método: GET
- Descrição: Serve a página principal de pagamento se o usuário estiver autenticado.
- Ações: Verificação de sessão, configuração de cookies e envio do arquivo `public/home.html`.


### `/logout`

```javascript
app.get('/logout', (req, res) => { ... });
```

- Método: GET
- Descrição: Destrói a sessão atual do usuário e redireciona para a página de login.
- Ações: Destruição de sessão e limpeza de cookies.

### `/get-transactions`

```javascript
  app.get('/receber', (req, res) => { ... });
```
- Método: GET
- Descrição: Retorna as transações do usuário autenticado.
- Ações: Verificação de sessão, leitura do arquivo `pagar.json` e filtragem das transações do usuário.

### `/add-transaction`

```javascript
  app.post('/adicionar-pagamento', (req, res) => { ... });
```
- Método: POST
- Descrição: Adiciona uma nova transação para o usuário autenticado.
- Ações: Verificação de sessão, leitura e escrita no arquivo `pagar.json`.

### `/delete-transaction`

```javascript
 app.post('/deletar-pagamento', (req, res) => { ... });
```

- Método: POST
- Descrição: Exclui uma transação específica do usuário autenticado.
- Ações: Verificação de sessão, leitura e escrita no arquivo `pagar.json`, filtragem e remoção da transação.

### `/mark-as-paid`

  ```javascript
  app.post('/marca-pago', (req, res) => { ... });
  ```


- Método: POST
- Descrição: Marca uma transação específica como paga para o usuário autenticado.
- Ações: Verificação de sessão, leitura e escrita no arquivo `pagar.json`, atualização do status da transação.


### `/mark-receivable-as-paid`

```javascript
app.post('/marca-receber-pagar', (req, res) => { ... });
 ```

- Método: POST
- Descrição: Marca um recebível específico como pago.
- Ações: Leitura e escrita no arquivo `receber.json`, atualização do status do recebível.

### `/receber`
 
```javascript
 app.get('/receber', (req, res) => { ... });
 ```

- Método: GET
- Descrição: Serve a página de recebíveis se o usuário estiver autenticado.
- Ações: Verificação de sessão e envio do arquivo `public/receber.html`.

### `/get-receivables`
  
```javascript
  app.get('/recebimento', (req, res) => { ... });
```

- Método: GET
- Descrição: Retorna os recebíveis do usuário autenticado.
- Ações: Verificação de sessão, leitura do arquivo receber.json e filtragem dos recebíveis do usuário.

### `/add-receivable`

```javascript
  app.post('/adicionar-recebimento', (req, res) => { ... });
```

- Método: POST
- Descrição: Adiciona um novo recebível para o usuário autenticado.
- Ações: Verificação de sessão, leitura e escrita no arquivo `receber.json`.

### `/delete-receivable`

```javascript
  app.post('/deletar-recebimento', (req, res) => { ... });
```

- Método: POST
- Descrição: Exclui um recebível específico do usuário autenticado.
- Ações: Verificação de sessão, leitura e escrita no arquivo `receber.json`, filtragem e remoção do recebível.

### Servidor
```javascript
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login`);
});
```
- Descrição: Inicia o servidor na porta definida (3001) e exibe uma mensagem no console com a URL para acessar o login.




  



## Estrutura do projeto

```javascript
ADO_WS
├── node_modules/
├── public/
│ ├── css/
│ │ └── styles.css
│ ├── images/
│ │ └── favicon.png
│ ├── js/
│ │ ├── home.js
│ │ ├── login.js
│ │ ├── pagar.js
│ │ ├── receber.js
│ │ └── registro.js
│ ├── home.html
│ ├── login.html
│ ├── pagar.html
│ ├── receber.html
│ └── registro.html
├── bills.json
├── index.js
├── package-lock.json
├── package.json
├── README.md
├── receber.json
├── pagar.json
└── usuario.json
```

<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" height="30" width="40">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS3" height="30" width="40">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-plain.svg" alt="JavaScript" height="30" width="40">
</div>

