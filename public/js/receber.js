document.addEventListener('DOMContentLoaded', function () {
    axios.get('/get-receivables').then(response => {
        const receivables = response.data;
        const table = document.getElementById('receivablesList');
        let totalPago = 0;
        let totalAReceber = 0;

        receivables.forEach(r => {
            const row = table.insertRow();
            row.insertCell(0).textContent = r.descricao;
            row.insertCell(1).textContent = r.valor.toFixed(2);
            row.insertCell(2).textContent = new Date(r.vencimento).toLocaleDateString();
            row.insertCell(3).textContent = r.status;

            // Cálculo dos totais baseado no status
            if (r.status === 'Pago') {
                totalPago += parseFloat(r.valor);
            } else if (r.status === 'À Receber') {
                totalAReceber += parseFloat(r.valor);
            }

            // Botão Excluir
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = () => deleteReceivable(r.id, row);
            row.insertCell(4).appendChild(deleteButton);

            // Botão Recebido
            if (r.status === 'À Receber') { // Apenas mostrar se ainda não foi pago
                const receivedButton = document.createElement('button');
                receivedButton.textContent = 'Recebido';
                receivedButton.className = 'btn btn-success btn-sm';
                receivedButton.onclick = () => markAsReceived(r.id, row);
                row.cells[4].appendChild(receivedButton);
            }
        });

        // Atualizar os totais no HTML
        document.getElementById('totalPago').innerHTML = `<strong>Total Pago: </strong>R$ ${totalPago.toFixed(2)}`;
        document.getElementById('totalAReceber').innerHTML = `<strong>Total a Receber: </strong>R$ ${totalAReceber.toFixed(2)}`;
    }).catch(error => console.error('Erro ao carregar recebíveis:', error));
});

// Função para marcar como recebido
function markAsReceived(id, row) {
    axios.post('/mark-receivable-as-paid', { id })
        .then(response => {
            alert('Recebimento marcado como pago com sucesso!');
            row.cells[3].textContent = 'Pago'; // Atualiza o status na tabela
            // Remove o botão de Recebido após alterar o status
            row.cells[4].children[1]?.remove();
        })
        .catch(error => alert('Erro ao marcar como recebido: ' + (error.response ? error.response.data.message : 'Erro desconhecido')));
}



// Função para adicionar um novo recebível
document.getElementById('formRecebivel').addEventListener('submit', function (event) {
    event.preventDefault();
    const descricao = document.getElementById('descricaoRecebivel').value;
    const valor = parseFloat(document.getElementById('valorRecebivel').value);
    const vencimento = document.getElementById('vencimentoRecebivel').value;

    axios.post('/add-receivable', { descricao, valor, vencimento })
        .then(response => {
            // Adiciona o novo recebível na tabela
            const table = document.getElementById('receivablesList');
            const row = table.insertRow();
            row.insertCell(0).textContent = descricao;
            row.insertCell(1).textContent = valor.toFixed(2);
            row.insertCell(2).textContent = new Date(vencimento).toLocaleDateString();
            row.insertCell(3).textContent = 'À Receber'; // Supondo que o status inicial é 'À Receber'

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = () => deleteReceivable(response.data.id, row); // Adiciona a função de excluir
            row.insertCell(4).appendChild(deleteButton);

            // Limpa o formulário e fecha o modal
            document.getElementById('formRecebivel').reset();
            $('#modalRecebivel').modal('hide');

            alert('Recebimento adicionado com sucesso!');
        })
        .catch(error => alert('Erro ao adicionar recebimento: ' + (error.response ? error.response.data.message : 'Erro desconhecido')));
});

function deleteReceivable(id, row) {
    axios.post('/delete-receivable', { id })
        .then(response => {
            alert('Recebimento excluído com sucesso!');
            row.remove(); // Remove a linha da tabela
        })
        .catch(error => alert('Erro ao excluir recebimento: ' + (error.response ? error.response.data.message : 'Erro desconhecido')));
}
