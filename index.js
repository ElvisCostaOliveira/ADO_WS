const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const BD = path.join(__dirname, 'pagar.json');
const BDR = path.join(__dirname, 'receber.json');
const USER_DATA_FILE = path.join(__dirname, 'usuario.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(session({
    secret: 'lock',
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

let usersData = initDataFile(USER_DATA_FILE, { usuarios: [] });

app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'registro.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.post('/registro', async (req, res) => {
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
        res.cookie('username', usuario.nome, { httpOnly: false });
        res.redirect('/pagar');
    } else {
        res.status(401).send('Credenciais inválidas');
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
            return res.status(500).send('Falha');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login');
    });
});


app.get('/receber', (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Não autorizado');
    } else {
        const data = JSON.parse(fs.readFileSync(BD, 'utf8'));
        const transacoesUsuario = data.transacoes.filter(t => t.usuarioId === req.session.user.id);
        res.json(transacoesUsuario);
    }
});


app.post('/adicionar-pagamento', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado');
    }
    let data = JSON.parse(fs.readFileSync(BD, 'utf8'));
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
    fs.writeFileSync(BD, JSON.stringify(data), 'utf8');
    res.send('Transação adicionada com sucesso!');
});


app.post('/deletar-pagamento', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(BD, 'utf8'));
    const index = data.transacoes.findIndex(t => t.id === id && t.usuarioId === req.session.user.id);
    if (index > -1) {
        data.transacoes.splice(index, 1);
        fs.writeFileSync(BD, JSON.stringify(data), 'utf8');
        res.send('Pagamento excluída com sucesso!');
    } else {
        res.status(404).send('Pagamento não encontrada.');
    }
});

app.post('/marca-pago', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(BD, 'utf8'));
    const transaction = data.transacoes.find(t => t.id === id && t.usuarioId === req.session.user.id);
    if (transaction) {
        transaction.status = 'Pago';
        fs.writeFileSync(BD, JSON.stringify(data), 'utf8');
        res.send('Paga com sucesso!');
    } else {
        res.status(404).send('Pagamento não encontrada.');
    }
});

app.post('/marca-receber-pagar', (req, res) => {
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(BDR, 'utf8'));
    const transaction = data.transacoes.find(t => t.id === id);
    if (transaction) {
        transaction.status = 'Pago';
        fs.writeFileSync(BDR, JSON.stringify(data), 'utf8');
        res.send('Recebimento marcado como pago com sucesso!');
    } else {
        res.status(404).send('Recebimento não encontrado.');
    }
});

// Contas a Receber Routes
app.get('/receber', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'receber.html'));
    }
});


app.get('/recebimento', (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Não autorizado.');
    } else {
        const data = JSON.parse(fs.readFileSync(BDR, 'utf8'));
        const recebiveisUsuario = data.transacoes.filter(t => t.usuarioId === req.session.user.id);
        res.json(recebiveisUsuario);
    }
});


app.post('/adicionar-recebimento', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    let data = JSON.parse(fs.readFileSync(BDR, 'utf8'));
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
    fs.writeFileSync(BDR, JSON.stringify(data), 'utf8');
    res.send('Recebimento adicionado com sucesso!');
});




app.post('/deletar-recebimento', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Não autorizado.');
    }
    const { id } = req.body;
    let data = JSON.parse(fs.readFileSync(BDR, 'utf8'));
    const index = data.transacoes.findIndex(t => t.id === id && t.usuarioId === req.session.user.id);
    if (index > -1) {
        data.transacoes.splice(index, 1);
        fs.writeFileSync(BDR, JSON.stringify(data), 'utf8');
        res.send('Recebimento excluído com sucesso!');
    } else {
        res.status(404).send('Recebimento não encontrado.');
    }
});

// Retorno Geral
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/login`);
});
