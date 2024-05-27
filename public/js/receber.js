document.addEventListener('DOMContentLoaded', function () {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('username='));
    if (cookieValue) {
        const username = decodeURIComponent(cookieValue.split('=')[1]);
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('username').textContent = 'Usuário não identificado';
    }
    const tableElement = $('#tableReceivables');
    let dataTable = tableElement.DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.12.1/i18n/pt-BR.json'
        }
    });

    const loadReceivables = () => {
        axios.get('/get-receivables').then(response => {
            dataTable.clear();
            const receivables = response.data;
            let totalPago = 0;
            let totalAReceber = 0;

            receivables.forEach(r => {
                const rowNode = dataTable.row.add([
                    r.descricao,
                    r.valor.toFixed(2),
                    new Date(r.vencimento).toLocaleDateString(),
                    r.status,
                    createActionButtonGroup(r)
                ]).draw(false).node();

                if (r.status === 'Pago') {
                    totalPago += parseFloat(r.valor);
                } else if (r.status === 'À Receber') {
                    totalAReceber += parseFloat(r.valor);
                }
                $(rowNode).find('.delete-button').on('click', function () {
                    deleteReceivable(r.id, rowNode);
                });
                if (r.status === 'À Receber') {
                    $(rowNode).find('.received-button').on('click', function () {
                        markAsReceived(r.id, rowNode);
                    });
                }
            });

            // Atualizar totais
            localStorage.setItem('totalPago', totalPago);
            localStorage.setItem('totalAReceber', totalAReceber);
            document.getElementById('totalPago').innerHTML = `<strong>Total Pago: </strong>R$ ${totalPago.toFixed(2)}`;
            document.getElementById('totalAReceber').innerHTML = `<strong>Total a Receber: </strong>R$ ${totalAReceber.toFixed(2)}`;
        }).catch(error => console.error('Erro ao carregar recebíveis:', error));
    };

    loadReceivables();

    document.getElementById('formRecebivel').addEventListener('submit', function (event) {
        event.preventDefault();
        const descricao = document.getElementById('descricaoRecebivel').value;
        const valor = parseFloat(document.getElementById('valorRecebivel').value);
        const vencimento = document.getElementById('vencimentoRecebivel').value;

        axios.post('/add-receivable', { descricao, valor, vencimento })
            .then(response => {
                const newRow = dataTable.row.add([
                    descricao,
                    valor.toFixed(2),
                    new Date(vencimento).toLocaleDateString(),
                    'À Receber',
                    createActionButtonGroup({ id: response.data.id, status: 'À Receber' })
                ]).draw(false).node();

                $(newRow).find('.delete-button').on('click', function () {
                    deleteReceivable(response.data.id, newRow);
                });
                $(newRow).find('.received-button').on('click', function () {
                    markAsReceived(response.data.id, newRow);
                });

                document.getElementById('formRecebivel').reset();
                $('#modalRecebivel').modal('hide');
                alert('Recebimento adicionado com sucesso!');
            })
            .catch(error => alert('Erro ao adicionar recebimento: ' + (error.response ? error.response.data.message : 'Erro desconhecido')));
    });

    function createActionButtonGroup(receivable) {
        return `
            <button class="btn btn-danger btn-sm delete-button">Excluir</button>
            ${receivable.status === 'À Receber' ? `<button class="btn btn-success btn-sm received-button">Recebido</button>` : ''}
        `;
    }

    function deleteReceivable(id, rowNode) {
        axios.post('/delete-receivable', { id })
            .then(response => {
                alert('Recebimento excluído com sucesso!');
                dataTable.row($(rowNode)).remove().draw();
            })
            .catch(error => alert('Erro ao excluir recebimento: ' + (error.response ? error.response.data.message : 'Erro desconhecido')));
    }

    function markAsReceived(id, rowNode) {
        axios.post('/mark-receivable-as-paid', { id })
            .then(response => {
                alert('Recebimento marcado como pago com sucesso!');
                dataTable.cell($(rowNode).find('td').eq(3)).data('Pago').draw();
                $(rowNode).find('.received-button').remove();
            })
            .catch(error => alert('Erro ao marcar como recebido: ' + (error.response ? error.response.data.message : 'Erro desconhecido')));
    }
});
