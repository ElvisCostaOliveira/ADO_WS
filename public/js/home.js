document.addEventListener('DOMContentLoaded', function() {
    const getUsernameFromCookies = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; username=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const usernameSpan = document.getElementById('username');
    usernameSpan.textContent = getUsernameFromCookies() || 'Usuário';
    
    fetch('/get-transactions-summary')
        .then(response => response.json())
        .then(data => createChart(data, 'contasPagarChart', 'Contas a Pagar'));

    fetch('/get-receivables-summary')
        .then(response => response.json())
        .then(data => createChart(data, 'contasReceberChart', 'Contas a Receber'));
});

function createChart(data, canvasId, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const totalValues = data.map(item => item.valor);
    const labels = data.map(item => item.descricao);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: totalValues,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

