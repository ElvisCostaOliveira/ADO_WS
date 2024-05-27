const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const TRANSACTION_DATA_FILE = path.join(__dirname, 'transactions.json');
const RECEIVABLES_DATA_FILE = path.join(__dirname, 'receivables.json');
const USER_DATA_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(session({
    secret: 'segredo muito secreto',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

function initDataFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData), 'utf8');
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const transactionsData = initDataFile(TRANSACTION_DATA_FILE, { transacoes: [] });
const receivablesData = initDataFile(RECEIVABLES_DATA_FILE, { transacoes: [] });
let usersData = initDataFile(USER_DATA_FILE, { usuarios: [] });

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (usersData.usuarios.some(u => u.email === email)) {
        return res.status(400).send('Email já cadastrado.');
    }
    const hashedPassword = await bcrypt.hash(senha, 10);
    const novoUsuario = { id: usersData.usuarios.length + 1, nome, email, senha: hashedPassword };
    usersData.usuarios.push(novoUsuario);
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(usersData), 'utf8');
    req.session.user = novoUsuario;
    res.redirect('/pagar');
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = usersData.usuarios.find(u => u.email === email);
    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
        req.session.user = usuario;
        res.cookie('username', usuario.nome, { httpOnly: false }); // Armazenar o nome no cookie
        res.redirect('/pagar');
    } else {
        res.status(401).send('Credenciais inválidas ou usuário não registrado.');
    }
});


app.get('/pagar', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.cookie('username', req.session.user.nome, { httpOnly: false });
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Falha ao deslogar');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login');
    });
});


app.get('/get-transactions', (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Não autorizado.');
    } else {
        const data = JSON.parse(fs.readFileSync(TRANSACTION_DATA_FILE, 'utf8'));
        const transacoesUsuario = data.transacoes.filter(t => t.usuarioId === req.session.user.id);
        res.json(transacoesUsuario);
    }
});


app.post('/add-transaction', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    let data = JSON.parse(fs.readFileSync(TRANSACTION_DATA_FILE, 'utf8'));
    const { descricao, tipo, categoria, valor, vencimento } = req.body;

   
    const newId = data.transacoes.reduce((maxId, transaction) => Math.max(maxId, transaction.id), 0) + 1;

    const transacao = {
        id: newId,
        descricao,
        tipo,
        categoria,
        valor,
        vencimento,
        usuarioId: req.session.user.id,
        data: new Date().toISOString()
    };

    data.transacoes.push(transacao);
    fs.writeFileSync(TRANSACTION_DATA_FILE, JSON.stringify(data), 'utf8');
    res.send('Transação adicionada com sucesso!');
});


app.post('/delete-transaction', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(TRANSACTION_DATA_FILE, 'utf8'));
    const index = data.transacoes.findIndex(t => t.id === id && t.usuarioId === req.session.user.id);
    if (index > -1) {
        data.transacoes.splice(index, 1);
        fs.writeFileSync(TRANSACTION_DATA_FILE, JSON.stringify(data), 'utf8');
        res.send('Transação excluída com sucesso!');
    } else {
        res.status(404).send('Transação não encontrada.');
    }
});

app.post('/mark-as-paid', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(TRANSACTION_DATA_FILE, 'utf8'));
    const transaction = data.transacoes.find(t => t.id === id && t.usuarioId === req.session.user.id);
    if (transaction) {
        transaction.status = 'Pago';
        fs.writeFileSync(TRANSACTION_DATA_FILE, JSON.stringify(data), 'utf8');
        res.send('Transação marcada como paga com sucesso!');
    } else {
        res.status(404).send('Transação não encontrada.');
    }
});

app.post('/mark-receivable-as-paid', (req, res) => {
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(RECEIVABLES_DATA_FILE, 'utf8'));
    const transaction = data.transacoes.find(t => t.id === id);
    if (transaction) {
        transaction.status = 'Pago';
        fs.writeFileSync(RECEIVABLES_DATA_FILE, JSON.stringify(data), 'utf8');
        res.send('Recebimento marcado como pago com sucesso!');
    } else {
        res.status(404).send('Recebimento não encontrado.');
    }
});


// Contas a Receber

// Contas a Receber Routes
app.get('/receber', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'receber.html'));
    }
});


app.get('/get-receivables', (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Não autorizado.');
    } else {
        const data = JSON.parse(fs.readFileSync(RECEIVABLES_DATA_FILE, 'utf8'));
        const recebiveisUsuario = data.transacoes.filter(t => t.usuarioId === req.session.user.id);
        res.json(recebiveisUsuario);
    }
});


app.post('/add-receivable', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    let data = JSON.parse(fs.readFileSync(RECEIVABLES_DATA_FILE, 'utf8'));
    const { descricao, valor, vencimento } = req.body;

    const newReceivable = {
        id: data.transacoes.reduce((maxId, item) => item.id > maxId ? item.id : maxId, 0) + 1,
        descricao,
        valor,
        vencimento,
        status: 'À Receber',
        usuarioId: req.session.user.id
    };

    data.transacoes.push(newReceivable);
    fs.writeFileSync(RECEIVABLES_DATA_FILE, JSON.stringify(data), 'utf8');
    res.send('Recebimento adicionado com sucesso!');
});




app.post('/delete-receivable', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(RECEIVABLES_DATA_FILE, 'utf8'));
    const index = data.transacoes.findIndex(t => t.id === id && t.usuarioId === req.session.user.id);
    if (index > -1) {
        data.transacoes.splice(index, 1);
        fs.writeFileSync(RECEIVABLES_DATA_FILE, JSON.stringify(data), 'utf8');
        res.send('Recebimento excluído com sucesso!');
    } else {
        res.status(404).send('Recebimento não encontrado.');
    }
});



// Retorno Geral
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login`);
});
