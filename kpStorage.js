// Универсальные хранилища

//     function removeRow(btn) {
//     btn.closest('tr').remove();
// }

async function getAllKP() {
    if (window.storageAPI?.loadAllKP) {
        return await window.storageAPI.loadAllKP();
    }
    const data = localStorage.getItem('allKP');
    return data ? JSON.parse(data) : [];
}

async function saveAllKP(kpList) {
    if (window.storageAPI?.saveAllKP) {
        await window.storageAPI.saveAllKP(kpList);
    } else {
        localStorage.setItem('allKP', JSON.stringify(kpList));
    }
}

async function addKP(kpData) {
    const kpList = await getAllKP();
    kpList.push(kpData);
    await saveAllKP(kpList);
}

// Сохранение текущего КП
async function saveCurrentKP() {
    const clientName =
        document.getElementById('clientName').value || 'Не указано';
    const items = [];

    document.querySelectorAll('.row').forEach((row) => {
        const name = row.querySelector('.name').value;
        const unitSelect = row.querySelector('.unit');
        const unit = unitSelect.value;
        const unitCustom =
            unit === 'custom' ? row.querySelector('.unit-input').value : '';
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const price = parseFloat(row.querySelector('.price').value) || 0;
        const markup = parseFloat(row.querySelector('.markup').value) || 0;

        items.push({ name, unit, unitCustom, qty, price, markup });
    });

    const kpData = { clientName, date: new Date().toISOString(), items };

    await addKP(kpData);

    // вместо alert возвращаем нормальный фокус
    setTimeout(() => {
        const firstEditableInput = document.querySelector(
            '#items tbody .row .name',
        );

        if (firstEditableInput) {
            firstEditableInput.focus();
            firstEditableInput.blur();
        }
    }, 0);
}
function loadKPIntoTable(kpData) {
    const tableBody = document.querySelector('#items tbody');
    tableBody.innerHTML = '';

    kpData.items.forEach((item) => {
        // создаём строку через основную рабочую функцию
        addRow();

        const rows = tableBody.querySelectorAll('.row');
        const row = rows[rows.length - 1];

        const nameInput = row.querySelector('.name');
        const unitSelect = row.querySelector('.unit');
        const unitInput = row.querySelector('.unit-input');
        const qtyInput = row.querySelector('.qty');
        const priceInput = row.querySelector('.price');
        const markupInput = row.querySelector('.markup');

        nameInput.value = item.name || '';
        qtyInput.value = item.qty ?? '';
        priceInput.value = item.price ?? '';
        markupInput.value = item.markup ?? '';

        if (item.unitCustom) {
            unitSelect.value = 'custom';
            unitInput.style.display = 'inline';
            unitInput.value = item.unitCustom;
        } else {
            unitSelect.value = item.unit || 'шт';
            unitInput.style.display = 'none';
            unitInput.value = '';
        }
    });

    // небольшой хак для Electron: после перерисовки вернуть нормальный фокус ввода
    setTimeout(() => {
        const firstInput = tableBody.querySelector('.name');
        if (firstInput) {
            firstInput.focus();
            firstInput.blur();
        }
    }, 0);
}

async function loadSavedKP(index) {
    const kpList = await getAllKP();
    const kp = kpList[index];

    if (!kp) return;

    document.getElementById('clientName').value = kp.clientName;
    loadKPIntoTable(kp);

    alert('Данные КП загружены!');
}

function openKPModal() {
    document.getElementById('kpModal').style.display = 'block';
    showSavedKP();
}

document.getElementById('closeModal').onclick = function () {
    document.getElementById('kpModal').style.display = 'none';
};

// закрытие по клику вне окна
window.onclick = function (e) {
    const modal = document.getElementById('kpModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};

async function showSavedKP() {
    const kpList = await getAllKP();

    // СОРТИРОВКА: новые сверху
    kpList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('kpListContainer');

    container.innerHTML = '';

    if (!kpList.length) {
        container.innerHTML = '<p>Нет сохранённых КП</p>';
        return;
    }

    kpList.forEach((kp, index) => {
        const row = document.createElement('div');
        row.classList.add('kp-row');

        const date = kp.date.split('T')[0];

        row.innerHTML = `
            <div class="kp-info">
                <strong>${kp.clientName}</strong>
                <span>${date}</span>
            </div>
            <div class="kp-actions">
                <button class="load-btn">Загрузить</button>
                <button class="delete-btn">Удалить</button>
            </div>
        `;

        // Загрузка
        row.querySelector('.load-btn').onclick = () => {
            document.getElementById('kpModal').style.display = 'none';

            document.getElementById('clientName').value = kp.clientName;
            loadKPIntoTable(kp);

            setTimeout(() => {
                const firstInput = document.querySelector('#items tbody .name');
                if (firstInput) firstInput.focus();
            }, 50);
        };

        // Удаление
        row.querySelector('.delete-btn').onclick = async () => {
            if (!confirm('Удалить это КП?')) return;

            kpList.splice(index, 1);
            await saveAllKP(kpList);
            showSavedKP(); // перерисовка
        };

        container.appendChild(row);
    });
}
