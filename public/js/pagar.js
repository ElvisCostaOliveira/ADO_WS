document.addEventListener('DOMContentLoaded', function() {
    axios.get('/receber').then(response => {
        const pagamentos = response.data;
        let totalDentroDoPrazo = 0, totalVencido = 0, totalPagos = 0;
        const table = document.getElementById('listaPagamento');
        pagamentos.forEach(t => {
            const row = table.insertRow();
            const status = new Date(t.vencimento) < new Date() ? 'Vencido' : (t.status === 'Pago' ? 'Pago' : 'Dentro do prazo');
            const valor = parseFloat(t.valor);
            row.insertCell(0).textContent = t.descricao;
            row.insertCell(1).textContent = status;
            row.insertCell(2).textContent = `R$ ${valor.toFixed(2)}`;
            row.insertCell(3).textContent = new Date(t.vencimento).toLocaleDateString();

            const actionsCell = row.insertCell(4);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = function() { deleteTransaction(row, t); };
            actionsCell.appendChild(deleteButton);

            if (status === 'Dentro do prazo' || status === 'Vencido') {
                const payButton = document.createElement('button');
                payButton.textContent = 'Pago';
                payButton.className = 'btn btn-success btn-sm';
                payButton.onclick = function() { marcarPago(row, t); };
                actionsCell.appendChild(payButton);
            }

            if (status === 'Dentro do prazo') {
                totalDentroDoPrazo += valor;
            } else if (status === 'Vencido') {
                totalVencido += valor;
            } else if (status === 'Pago') {
                totalPagos += valor;
            }
        });
        localStorage.setItem('totalDentroDoPrazo', totalDentroDoPrazo);
        localStorage.setItem('totalVencido', totalVencido);
        localStorage.setItem('totalPagos', totalPagos);
        document.getElementById('totalDentroDoPrazo').innerHTML = `<strong>Total em Dia:</strong> R$ ${totalDentroDoPrazo.toFixed(2)}`;
        document.getElementById('totalVencido').innerHTML = `<strong>Total Vencido:</strong> R$ ${totalVencido.toFixed(2)}`;
        document.getElementById('totalPagos').innerHTML = `<strong>Total Pago:</strong> R$ ${totalPagos.toFixed(2)}`;

        $('.table').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.12.1/i18n/pt-BR.json'
            }
        });
    }).catch(error => {
        console.error('Erro ao carregar transações:', error);
    });
});

function marcarPago(row, transaction) {
    axios.post('/marca-pago', { id: transaction.id })
        .then(response => {
            alert(response.data); 
            transaction.status = 'Pago';
            row.cells[1].textContent = 'Pago';
            let payButton = row.cells[4].getElementsByTagName('button')[1]; 
            if (payButton) {
                payButton.remove(); 
            }
            atualizaTotal(); 
        })
        
}

function deleteTransaction(row, transaction) {
    axios.post('/deletar-pagamento', { id: transaction.id })
        .then(response => {
            alert('Transação excluída com sucesso!');
            row.remove(); 
        })
        .catch(error => {
            alert('Erro ao excluir transação: ' + (error.response ? error.response.data.message : 'Erro desconhecido'));
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('username='));
    if (cookieValue) {
        const username = decodeURIComponent(cookieValue.split('=')[1]);
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('username').textContent = 'Usuário não identificado';
    }
});

function addToTable(descricao, valor, vencimento, tipo) {
    const table = document.getElementById('listaPagamento');
    const row = table.insertRow();
    const isOverdue = new Date(vencimento) < new Date();
    const status = isOverdue ? 'Vencido' : 'Dentro do prazo';
    

    row.insertCell(0).textContent = descricao;
    const statusCell = row.insertCell(1);
    statusCell.innerHTML = `<span class="status-circle" style="background-color: ${statusColor};"></span> ${status}`;
    row.insertCell(2).textContent = `R$ ${parseFloat(valor).toFixed(2)}`;
    row.insertCell(3).textContent = new Date(vencimento).toLocaleDateString();

    const deleteCell = row.insertCell(4);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.onclick = function() { deleteTransaction(row); };
    deleteCell.appendChild(deleteButton);
}

function atualizaTotal() {
    const rows = document.querySelectorAll('#listaPagamento tr');
    let totalReceitas = 0;
    let totalDespesas = 0;
    rows.forEach(row => {
        const valor = parseFloat(row.cells[2].textContent.replace('R$ ', ''));
        const tipo = row.cells[1].textContent.includes('Dentro do prazo') || row.cells[1].textContent.includes('Vencido') ? 'Despesa' : 'Receita';
        if (tipo === 'Receita') {
            totalReceitas += valor;
        } else {
            totalDespesas += valor;
        }
    });
    document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('saldoFinal').textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
}

document.getElementById('formDespesa').addEventListener('submit', function(event) {
    event.preventDefault();
    const descricao = document.getElementById('pagarDesc').value;
    let vencimento = document.getElementById('vencimentoDespesa').value;
    const valor = parseFloat(document.getElementById('valorDespesa').value);

    let dataObj = new Date(vencimento + 'T00:00:00'); 
    dataObj.setMinutes(dataObj.getMinutes() - dataObj.getTimezoneOffset()); 
    vencimento = dataObj.toISOString().split('T')[0]; 

    axios.post('/adicionar-pagamento', {
        descricao: descricao,
        valor: valor,
        vencimento: vencimento,
        tipo: 'Despesa'
    }).then(function(response) {
        alert('Despesa adicionada com sucesso!');
        $('#pagarModal').modal('hide');
        // Recarrega a página para atualizar todos os dados incluindo totais
        location.reload();
    }).catch(function(error) {
        alert('Erro ao adicionar despesa: ' + (error.response ? error.response.data.message : 'Erro desconhecido'));
    });
});


