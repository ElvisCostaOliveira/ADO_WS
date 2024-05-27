document.addEventListener('DOMContentLoaded', function () {
    const username = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
    if (username) {
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('username').textContent = 'Usuário não identificado';
    }
});


    // Listener para o formulário de adicionar recebimentos
    document.getElementById('formDespesa').addEventListener('submit', function(event) {
        event.preventDefault();  // Isso impede que o formulário seja submetido da maneira tradicional, o que recarregaria a página.
        const descricao = document.getElementById('descricaoDespesa').value;
        const valor = document.getElementById('valorDespesa').value;
        const vencimento = document.getElementById('vencimentoDespesa').value;
    
        axios.post('/add-receivable', {
            descricao,
            valor,
            vencimento
        })
        .then(response => {
            alert('Recebimento adicionado com sucesso!');
            location.reload();
        })
        .catch(error => {
            console.error('Erro ao adicionar recebimento:', error);
            alert('Erro ao adicionar recebimento: ' + (error.response ? error.response.data : 'Erro desconhecido'));
        });
    });
    
    

    function loadReceivables() {
        axios.get('/get-receivables')
            .then(response => {
                const receivables = response.data;
                const table = document.getElementById('transactionsList');
                table.innerHTML = '';
                receivables.forEach(receivable => {
                    const row = table.insertRow();
                    row.insertCell(0).textContent = receivable.descricao;
                    row.insertCell(1).textContent = receivable.status;
                    row.insertCell(2).textContent = `R$ ${parseFloat(receivable.valor).toFixed(2)}`;
                    row.insertCell(3).textContent = new Date(receivable.vencimento).toLocaleDateString();
                    // Adicione mais células se necessário
                });
            })
            .catch(error => console.error('Erro ao carregar recebíveis:', error));
    }
    

function addReceivable() {
    const descricao = document.getElementById('descricaoDespesa').value;
    const valor = document.getElementById('valorDespesa').value;
    const vencimento = document.getElementById('vencimentoDespesa').value;

    axios.post('/add-receivable', {
        descricao,
        valor,
        vencimento,
        status: 'À Receber' // Adiciona como à receber por padrão
    })
        .then(response => {
            alert('Recebimento adicionado com sucesso!');
            $('#modalDespesa').modal('hide'); // Fecha o modal
            loadReceivables(); // Recarrega a lista de recebíveis
        })
        .catch(error => {
            console.error('Erro ao adicionar recebimento:', error);
            alert('Erro ao adicionar recebimento: ' + error.message);
        });
}

function deleteReceivable(id) {
    axios.post('/delete-receivable', { id })
        .then(response => {
            alert('Recebimento excluído com sucesso!');
            loadReceivables(); // Recarrega a lista de recebíveis
        })
        .catch(error => {
            console.error('Erro ao excluir recebimento:', error);
            alert('Erro ao excluir recebimento: ' + error.message);
        });
}
