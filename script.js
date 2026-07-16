// База организаций

const organizations = [
    {
        name: 'ООО «Октава-Мед»',
        inn: 'ИНН 6325064456, КПП 632501001, ОГРН 1146325002944',
        address: '46001, Самарская область, г.Сызрань, ул. Ульяновская, д. 94',
        bank: 'Р/с 40702810129520002153 в филиал «НИЖЕГОРОДСКИЙ» АО «АЛЬФА-БАНК» г.Нижний Новгород к/с 30101810200000000824, БИК 042202824',
        phone: '+7 (900) 123-45-67',
        email: 'info1@example.com',
        logo: 'oktava_logo.png',
        style: 'style1',
    },
    {
        name: 'ООО «Спектр+»',
        inn: 'ИНН 6314025208 КПП 631401001 ОГРН 1056314026340',
        address: '',
        bank: '',
        phone: '',
        email: 'info1@example.com',
        logo: 'Spectr_logo.jpg',
        style: 'style2',
    },
    {
        name: 'ООО "ФармЛайн"',
        inn: 'ИНН 7714511476, КПП 773501001',
        address:
            '124460, Москва, Зеленоград, Генерала Алексеева пр-кт, д.42, стр.1',
        bank: '',
        phone: 'тел.: (495) 234-07-04',
        email: 'office@pharmline.ru',
        logo: 'pharmline_logo.jpg',
        style: 'style3',
    },
    {
        name: 'ИП Федькова Елена Владимировна',
        inn: 'ИНН 631405585041, ОГРНИП 325632700155872',
        address: 'г. Самара, ул. Стара Загора, д. 220 кв./оф. 282',
        bank: [
            'р/с: 40802810129390007204',
            'ФИЛИАЛ «НИЖЕГОРОДСКИЙ» АО «АЛЬФА-БАНК»',
            'к/с: 30101810200000000824',
        ],
        phone: '',
        email: '',
        style: 'style4',
    },
    {
        name: 'Индивидуальный предприниматель Лузин Павел Геннадьевич',
        inn: 'ИНН 632521890834, ОГРНИП 320631300081886',
        address: '446020, г.Сызрань, ул.Есенина, д.13, кв 1 ',
        bank: [
            'Р/с 40802810129520001915',
            'ФИЛИАЛ "НИЖЕГОРОДСКИЙ" АО "АЛЬФА-БАНК',
            'к/с 30101810200000000824',
        ],
        phone: '',
        email: '',
        style: 'style5',
    },
];

// ====== БАЗА ТОВАРОВ ======
function getProducts() {
    try {
        return JSON.parse(localStorage.getItem('products')) || [];
    } catch (error) {
        console.error('Ошибка чтения products из localStorage:', error);
        return [];
    }
}

function saveProducts(products) {
    try {
        localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
        console.error('Ошибка сохранения products в localStorage:', error);
    }
}

function saveProduct(name, price) {
    if (!name || price === '' || price === null || price === undefined) return;

    const trimmedName = String(name).trim();
    if (!trimmedName) return;

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return;

    const products = getProducts();
    const normalizedName = trimmedName.toLowerCase();

    const existingProduct = products.find(
        (p) => p.name && p.name.trim().toLowerCase() === normalizedName,
    );

    if (!existingProduct) {
        products.push({
            name: trimmedName,
            price: numericPrice,
        });

        saveProducts(products);
        return;
    }

    // Если товар уже есть, но цена изменилась — обновляем цену
    if (Number(existingProduct.price) !== numericPrice) {
        existingProduct.price = numericPrice;
        saveProducts(products);
    }
}

function findProducts(query) {
    const normalizedQuery = String(query || '')
        .trim()
        .toLowerCase();
    if (!normalizedQuery) return [];

    const products = getProducts();

    return products
        .filter((p) => p.name && p.name.toLowerCase().includes(normalizedQuery))
        .sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(normalizedQuery)
                ? 1
                : 0;
            const bStarts = b.name.toLowerCase().startsWith(normalizedQuery)
                ? 1
                : 0;
            return bStarts - aStarts;
        });
}

function setupAutocomplete(input) {
    const wrapper = input.parentElement;

    let container = wrapper.querySelector('.autocomplete-list');
    if (!container) {
        container = document.createElement('div');
        container.className = 'autocomplete-list';
        wrapper.appendChild(container);
    }

    let currentIndex = -1;
    let currentItems = [];

    function closeList() {
        container.innerHTML = '';
        currentIndex = -1;
        currentItems = [];
    }

    function renderList(items) {
        container.innerHTML = '';
        currentIndex = -1;
        currentItems = items;

        if (!items.length) return;

        items.slice(0, 6).forEach((product, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = product.name;

            item.addEventListener('mousedown', function (e) {
                e.preventDefault();
                selectItem(product);
            });

            container.appendChild(item);
        });
    }

    function updateActive() {
        const items = container.querySelectorAll('.autocomplete-item');
        items.forEach((item) => item.classList.remove('active'));

        if (currentIndex >= 0 && items[currentIndex]) {
            items[currentIndex].classList.add('active');
        }
    }

    function selectItem(product) {
        input.value = product.name;

        const row = input.closest('.row');
        if (row && product.price !== undefined && product.price !== null) {
            const priceInput = row.querySelector('.price');
            if (priceInput) {
                priceInput.value = product.price;
            }
        }

        closeList();
    }

    input.addEventListener('input', function () {
        const value = input.value.trim();

        if (!value) {
            closeList();
            return;
        }

        const matches = findProducts(value);
        renderList(matches);
    });

    input.addEventListener('keydown', function (e) {
        const visibleItems = container.querySelectorAll('.autocomplete-item');
        if (!visibleItems.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex++;
            if (currentIndex >= visibleItems.length) currentIndex = 0;
            updateActive();
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex--;
            if (currentIndex < 0) currentIndex = visibleItems.length - 1;
            updateActive();
        }

        if (e.key === 'Enter') {
            if (currentIndex > -1 && currentItems[currentIndex]) {
                e.preventDefault();
                selectItem(currentItems[currentIndex]);
            }
        }

        if (e.key === 'Escape') {
            closeList();
        }
    });

    input.addEventListener('blur', function () {
        setTimeout(() => {
            closeList();
        }, 150);
    });
}
// ====== ДОБАВЛЕНИЕ СТРОКИ ======
// Функция для добавления строки в таблицу с автоподстановкой
function addRow() {
    const tableBody = document.querySelector('#items tbody');
    const row = document.createElement('tr');
    row.classList.add('row');

    row.innerHTML = `
        <td style="position: relative;">
            <input type="text" class="name" placeholder="Наименование">
        </td>
        <td>
            <select class="unit">
                <option value="шт">шт</option>
                <option value="уп">уп</option>
                <option value="пары">пары</option>
                <option value="м">м</option>
                <option value="литр">литр</option>
                <option value="кг">кг</option>
                <option value="custom">Другая...</option>
            </select>
            <input type="text" class="unit-input" placeholder="Введите единицу..." style="display: none;">
        </td>
        <td><input type="number" class="qty" placeholder="Кол-во"></td>
        <td><input type="number" class="price" placeholder="Цена"></td>
        <td><input type="number" class="markup" placeholder="Наценка %"></td>
        <td><input type="number" class="total" placeholder="Итого" disabled></td>
        <td><button type="button" onclick="removeRow(this)">Удалить</button></td>
    `;

    tableBody.appendChild(row);

    const nameInput = row.querySelector('.name');
    const unitSelect = row.querySelector('.unit');
    const unitInput = row.querySelector('.unit-input');

    // Подключаем автоподсказки
    setupAutocomplete(nameInput);

    // Другая единица измерения
    unitSelect.addEventListener('change', function () {
        if (unitSelect.value === 'custom') {
            unitInput.style.display = 'inline';
            unitInput.focus();
        } else {
            unitInput.style.display = 'none';
            unitInput.value = '';
        }
    });
}

function setupAutocomplete(input) {
    const wrapper = input.parentElement;

    let suggestionBox = document.createElement('div');
    suggestionBox.className = 'suggestions';
    wrapper.appendChild(suggestionBox);

    let currentIndex = -1;
    let currentMatches = [];

    function closeSuggestions() {
        suggestionBox.innerHTML = '';
        suggestionBox.style.display = 'none';
        currentIndex = -1;
        currentMatches = [];
    }

    function renderSuggestions(matches) {
        suggestionBox.innerHTML = '';
        currentIndex = -1;
        currentMatches = matches;

        if (!matches.length) {
            suggestionBox.style.display = 'none';
            return;
        }

        matches.slice(0, 6).forEach((product, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = `${product.name} — ${product.price}`;

            item.addEventListener('mousedown', function (e) {
                e.preventDefault();
                selectSuggestion(product);
            });

            suggestionBox.appendChild(item);
        });

        suggestionBox.style.display = 'block';
    }

    function updateActiveSuggestion() {
        const items = suggestionBox.querySelectorAll('.suggestion-item');
        items.forEach((item) => item.classList.remove('active'));

        if (currentIndex >= 0 && items[currentIndex]) {
            items[currentIndex].classList.add('active');
        }
    }

    function selectSuggestion(product) {
        input.value = product.name;

        const row = input.closest('.row');
        if (row) {
            const priceInput = row.querySelector('.price');
            if (priceInput) {
                priceInput.value = product.price;
            }
        }

        closeSuggestions();
    }

    input.addEventListener('input', function () {
        const value = input.value.trim();

        if (value.length < 2) {
            closeSuggestions();
            return;
        }

        const matches = findProducts(value);
        renderSuggestions(matches);
    });

    input.addEventListener('keydown', function (e) {
        const items = suggestionBox.querySelectorAll('.suggestion-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex++;
            if (currentIndex >= items.length) currentIndex = 0;
            updateActiveSuggestion();
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex--;
            if (currentIndex < 0) currentIndex = items.length - 1;
            updateActiveSuggestion();
        }

        if (e.key === 'Enter') {
            if (currentIndex > -1 && currentMatches[currentIndex]) {
                e.preventDefault();
                selectSuggestion(currentMatches[currentIndex]);
            }
        }

        if (e.key === 'Escape') {
            closeSuggestions();
        }
    });

    input.addEventListener('blur', function () {
        setTimeout(() => {
            closeSuggestions();
        }, 150);
    });
}
// // ===== Удаление строки =====
// function removeRow(button) {
//     button.parentElement.parentElement.remove();
// }

// ====== Генерация чек боксов по организациям ======

function renderOrganizationCheckboxes() {
    const container = document.getElementById('orgCheckboxes');
    container.innerHTML = '';

    organizations.forEach((org, index) => {
        const wrapper = document.createElement('label');
        wrapper.classList.add('org-checkbox-item');

        wrapper.innerHTML = `
            <input type="checkbox" class="org-checkbox" value="${index}" checked>
            <span>${org.name}</span>
        `;

        container.appendChild(wrapper);
    });
}

// Вызов функции генерации чек боксов

document.addEventListener('DOMContentLoaded', () => {
    renderOrganizationCheckboxes();
});

// ====== Генерация PDF ======
document
    .getElementById('generatePDF')
    .addEventListener('click', async function () {
        const checkedBoxes = document.querySelectorAll('.org-checkbox:checked');

        if (!checkedBoxes.length) {
            alert('Выберите хотя бы одну организацию');
            return;
        }

        if (window.electronAPI) {
            const folder = await window.electronAPI.selectFolder();

            if (!folder) {
                alert('Папка не выбрана');
                return;
            }
        }

        for (const checkbox of checkedBoxes) {
            const index = Number(checkbox.value);
            const org = organizations[index];
            await generatePDF(org, index);
        }

        alert('Генерация завершена');
    });

// ====== ФУНКЦИИ ДЛЯ PDF ======
const arialnarrowBase64 = 'arialnarrow.base64.txt';
const robotoBase64 = 'Roboto-Medium.base64.txt';
const calibriBase64 = 'calibri.base64.txt';

async function generatePDF(org, index) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const clientName =
        document.getElementById('clientName').value || 'Не указано';

    doc.addFileToVFS('arialnarrow.ttf', arialnarrowBase64);
    doc.addFont('arialnarrow.base64.txt', 'Arialnarrow', 'normal');
    doc.addFileToVFS('calibri.ttf', calibriBase64);
    doc.addFont('calibri.base64.txt', 'Calibri', 'normal');
    doc.addFileToVFS('Roboto-Medium.ttf', robotoBase64);
    doc.addFont('Roboto-Medium.base64.txt', 'Roboto', 'normal');

    applyStyles(doc, org);

    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    const wrappedTitleText = doc.splitTextToSize(
        'Коммерческое предложение',
        maxWidth,
    );
    const wrappedClientText = doc.splitTextToSize(clientName, maxWidth);

    let currentY = 50;
    doc.setFontSize(14);
    doc.text(wrappedTitleText, pageWidth / 2, currentY, { align: 'center' });

    currentY += wrappedTitleText.length * 3 + 5;
    doc.setFontSize(12);
    doc.text(wrappedClientText, pageWidth / 2, currentY, { align: 'center' });

    if (org.logo) {
        const logoUrl = `./img/${org.logo}`;
        doc.addImage(logoUrl, 'PNG', 20, 5, 50, 30);
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const idNumbersKp = document.querySelectorAll('.id-number-kp');
    const idNumbersKpValues = [...idNumbersKp].map((input) => input.value);

    if (org.style === 'style1')
        doc.text(`Исходящий: ${formattedDate} ${idNumbersKpValues[0]}`, 20, 70);
    else if (org.style === 'style2')
        doc.text(`№КП${year}-${month}/${day} ${idNumbersKpValues[1]}`, 20, 70);
    else if (org.style === 'style3')
        doc.text(`№ ${year}${month}${day} ${idNumbersKpValues[2]}`, 20, 70);
    else if (org.style === 'style4')
        doc.text(`Коммерческое предложение № ${day}-${month}-${year}`, 20, 70);
    else if (org.style === 'style5')
        doc.text(`№ КП-${year}${month}${day}`, 20, 70);

    generatePDFContent(doc, org.name, org.style, index);

    // Печать и подпись
    const stampSignatureUrl = `./img/${org.style}_stamp_signature.jpg`;
    const img = new Image();
    img.src = stampSignatureUrl;

    function safeFileName(name) {
        return name
            .replace(/[<>:"/\\|?*]+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getTimeStamp() {
        const now = new Date();
        return now.toISOString().replace(/[:.]/g, '-');
    }

    img.onload = async function () {
        const maxHeight = 40;
        const imgRatio = img.width / img.height;
        const imgHeight = maxHeight;
        const imgWidth = imgHeight * imgRatio;

        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        const directorName = getDirectorName(org.style);
        const jobTitleName = getJobTitleName(org.style);

        // старт после таблицы
        let startY = doc.autoTable.previous.finalY + 20;

        // сколько нужно места
        const blockHeight = imgHeight + 20;

        // если не помещается → новая страница
        if (startY + blockHeight > pageHeight - 15) {
            doc.addPage();
            startY = 20;
        }

        // печать
        doc.addImage(
            img,
            'PNG',
            (pageWidth - imgWidth) / 2,
            startY,
            imgWidth,
            imgHeight,
        );

        // подпись
        doc.setFontSize(10);
        doc.text(jobTitleName, 20, startY + 15);
        doc.text(directorName, pageWidth - 20, startY + 15, { align: 'right' });

        // создаем blob 1 раз
        const pdfBlob = doc.output('blob');
        const arrayBuffer = await pdfBlob.arrayBuffer();

        if (window.electronAPI) {
            await window.electronAPI.savePDF({
                data: arrayBuffer,
                fileName: `Коммерческое_предложение_${safeFileName(org.name)}_${getTimeStamp()}.pdf`,
            });
        } else {
            doc.save(`Коммерческое_предложение_${safeFileName(org.name)}.pdf`);
        }
    };
}

function getJobTitleName(style) {
    if (style === 'style4') return 'Индивидуальный предприниматель';
    if (style === 'style5') return 'ИП';
    if (style === 'style1' || style === 'style2') return 'Директор';
    return '';
}

function getDirectorName(style) {
    if (style === 'style1') return 'Крючкова О.Г.';
    if (style === 'style3') return 'Фролова А.А';
    if (style === 'style4') return 'Федькова Е.В.';
    if (style === 'style5') return 'Лузин П.Г.';
    return '';
}

// ====== Стили PDF ======
function fixBankText(text) {
    if (!text) return '';
    const NBSP = '\u202F';
    return text
        .replace(/к\/с\s*(\d+)/gi, `к/с ${NBSP}$1`)
        .replace(/р\/с\s*(\d+)/gi, `Р/с ${NBSP}$1`)
        .replace(/БИК\s*(\d+)/gi, `БИК ${NBSP}$1`);
}

function applyStyles(doc, org) {
    if (org.style === 'style1') {
        doc.setFont('Roboto');
        doc.setFontSize(12);
        doc.text(org.name, 120, 15);
        doc.setFontSize(10);
        doc.text(org.inn, 90, 20);
        const addressLines = doc.splitTextToSize(`Адрес: ${org.address}`, 120);
        doc.text(addressLines, 80, 25);
        const bankLines = doc.splitTextToSize(fixBankText(org.bank), 100);
        doc.text(bankLines, 140, 30, { align: 'center' });
        const lineY =
            Math.max(25 + addressLines.length * 4, 30 + bankLines.length * 4) +
            1;
        doc.setLineWidth(0.3);
        doc.line(20, lineY, doc.internal.pageSize.width - 20, lineY);
    } else if (org.style === 'style2') {
        doc.setFont('Calibri');
        doc.setFontSize(14);
        doc.text(org.name, 90, 15, { align: 'left' });
        doc.setFontSize(10);
        doc.text(org.inn, 90, 20, { align: 'left' });
    } else if (org.style === 'style3') {
        doc.setFont('Arialnarrow');
        doc.setFontSize(12);
        doc.text(org.name, 200, 15, { align: 'right' });
        doc.setFontSize(10);
        doc.text(org.inn, 200, 20, { align: 'right' });
        doc.text(doc.splitTextToSize(`Адрес: ${org.address}`, 100), 200, 25, {
            align: 'right',
        });
        doc.text(org.bank, 200, 30, { align: 'right' });
        doc.text(`Телефон: ${org.phone}`, 200, 35, { align: 'right' });
        doc.text(`Email: ${org.email}`, 200, 40, { align: 'right' });
    } else if (org.style === 'style4') {
        doc.setFont('Calibri');
        doc.setFontSize(12);

        // Название слева
        doc.text(org.name, 20, 15);

        // Реквизиты справа
        doc.setFontSize(10);

        let rightX = doc.internal.pageSize.width - 20;

        doc.text(org.inn, rightX, 15, { align: 'right' });

        const addressLines = doc.splitTextToSize(`Адрес: ${org.address}`, 90);
        doc.text(addressLines, rightX, 20, { align: 'right' });

        const bankText = Array.isArray(org.bank)
            ? org.bank.join('\n')
            : org.bank;

        const bankLines = doc.splitTextToSize(bankText, 90);
        doc.text(bankLines, rightX, 20 + addressLines.length * 4, {
            align: 'right',
        });

        // Линия как в style1
        const lineY = 20 + addressLines.length * 4 + bankLines.length * 4 + 5;

        doc.setLineWidth(0.3);
        doc.line(20, lineY, doc.internal.pageSize.width - 20, lineY);
    } else if (org.style === 'style5') {
        doc.setFont('Calibri');
        doc.setFontSize(12);

        // Название справа
        doc.text(org.name, 200, 15, { align: 'right' });

        doc.setFontSize(10);

        doc.text(org.inn, 200, 20, { align: 'right' });

        const addressLines = doc.splitTextToSize(`Адрес: ${org.address}`, 100);
        doc.text(addressLines, 200, 25, { align: 'right' });

        const bankText = Array.isArray(org.bank)
            ? org.bank.join('\n')
            : org.bank;

        const bankLines = doc.splitTextToSize(bankText, 100);
        doc.text(bankLines, 200, 25 + addressLines.length * 4, {
            align: 'right',
        });

        // линия
        const lineY = 20 + addressLines.length * 4 + bankLines.length * 4 + 5;

        doc.setLineWidth(0.3);
        doc.line(20, lineY, doc.internal.pageSize.width - 20, lineY);
    }
}

// ====== Контент PDF (таблица) ======
function generatePDFContent(doc, companyName, style, kpIndex) {
    let tableData = [];

    document.querySelectorAll('.row').forEach((row) => {
        const name = row.querySelector('.name').value;
        let unit = row.querySelector('.unit').value;
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const price = parseFloat(row.querySelector('.price').value) || 0;
        let markup = parseFloat(row.querySelector('.markup').value) || 0;

        if (name && price) saveProduct(name, price);

        if (unit === 'custom') unit = row.querySelector('.unit-input').value;

        if (kpIndex === 1) markup += 5;
        else if (kpIndex === 2) markup += 7;

        const finalPrice = price * (1 + markup / 100);
        const finalSum = qty * finalPrice;

        tableData.push([
            name,
            unit,
            qty,
            finalPrice.toFixed(2),
            finalSum.toFixed(2),
        ]);
    });

    const total = tableData
        .reduce((acc, row) => acc + parseFloat(row[4]), 0)
        .toFixed(2);

    if (style === 'style1') tableData.push(['', '', '', 'Итого:', total]);

    localStorage.setItem(`kpData_${companyName}`, JSON.stringify(tableData));

    let tableStyles = {
        font: 'Roboto',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        styles: { font: 'Roboto' },
    };

    if (style === 'style2')
        tableStyles = {
            font: 'Calibri',
            headStyles: { fillColor: false, textColor: [0, 0, 0] },
            alternateRowStyles: { fillColor: false },
            styles: { font: 'Calibri', lineWidth: 0.5, lineColor: [0, 0, 0] },
        };
    if (style === 'style3')
        tableStyles = {
            font: 'Arialnarrow',
            headStyles: { fillColor: false, textColor: [0, 0, 0] },
            alternateRowStyles: { fillColor: false },
            styles: {
                font: 'Arialnarrow',
                lineWidth: 0.5,
                lineColor: [0, 0, 0],
            },
        };

    if (style === 'style4')
        tableStyles = {
            font: 'Calibri',
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
            },
            alternateRowStyles: { fillColor: false },
            styles: {
                font: 'Calibri',
                lineWidth: 0.5,
                lineColor: [0, 0, 0],
            },
        };

    if (style === 'style5')
        tableStyles = {
            font: 'Calibri',
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
            },
            alternateRowStyles: { fillColor: false },
            styles: {
                font: 'Calibri',
                lineWidth: 0.5,
                lineColor: [0, 0, 0],
            },
        };

    doc.autoTable({
        head: [['Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Итого']],
        body: tableData,
        startY: 90,
        ...tableStyles,
    });

    if (style !== 'style1') {
        doc.setFontSize(12);
        doc.text(
            `Итоговая сумма: ${total} руб.`,
            20,
            doc.autoTable.previous.finalY + 10,
        );
    }

    if (style === 'style1') {
        doc.setFontSize(10);
        const text = 'В том числе НДС - 5%';
        const pageWidth = doc.internal.pageSize.width;
        const xPosition = pageWidth - 20 - doc.getTextWidth(text);
        const yPosition = doc.autoTable.previous?.finalY
            ? doc.autoTable.previous.finalY + 5
            : 100;
        doc.text(text, xPosition, yPosition);
    }
}

function removeRow(btn) {
    const row = btn.closest('tr');
    if (row) {
        row.remove();
    }
}
