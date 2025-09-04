async function loadData() { // async function to load JSON data
    const response = await fetch("poistovne.json"); // fetch (bring) the JSON file from server
    return await response.json(); // parse (analyse) and return the JSON data
}

function buildCategories(data) {
    const order = ["Doplatky", "Rodina", "Dieťa", "Dospelý", "Žena", "Muž", "Senior"]; // custom order for categories
    const categories = [...new Set(data.map(d => d.Popis.split(" - ")[0]))]; // extract unique categories

    categories.sort((a, b) => order.indexOf(a) - order.indexOf(b)); // sort categories according to order

    const select = document.getElementById("filter"); // get dropdown element
    categories.forEach(cat => {
        const opt = document.createElement("option"); // create option element
        opt.value = cat; // set value of option
        opt.textContent = cat; // set displayed text
        select.appendChild(opt); // append option to dropdown
    });
}

function renderTable(data, category = "", search = "") {
    const tbody = document.querySelector("#comparisonTable tbody"); // get table body
    tbody.innerHTML = ""; // clear existing rows

    const groups = {}; // object to group data by Popis and Poistovna
    data.forEach(d => {
        if (!groups[d.Popis]) groups[d.Popis] = {}; // initialize group if not exists
        groups[d.Popis][d.Poistovna] = (groups[d.Popis][d.Poistovna] || []).concat(d.Benefit); // add benefit to group
    });

    const order = ["Doplatky", "Rodina", "Dieťa", "Dospelý", "Žena", "Muž", "Senior"]; // row sorting order

    Object.keys(groups) // iterate over each Popis
        .sort((a, b) => order.indexOf(a.split(" - ")[0]) - order.indexOf(b.split(" - ")[0])) // sort by category order
        .forEach(popis => {
            if (category && !popis.startsWith(category)) return; // skip if filtered by category

            const row = document.createElement("tr"); // create new table row

            const catCell = document.createElement("td"); // create first cell for "Popis"
            catCell.textContent = popis; // set text of category cell
            row.appendChild(catCell); // add category cell to row

            ["Dôvera", "VšZP", "UNION"].forEach(p => { // iterate over insurance companies
                const cell = document.createElement("td"); // create cell for each insurance
                const benefits = groups[popis][p] || []; // get benefits or empty array
                const filtered = benefits.filter(b => b.toLowerCase().includes(search.toLowerCase())); // filter by search text
                // display benefits as list or "-" if none
                cell.innerHTML = filtered.length ? "<ul>" + filtered.map(b => `<li>${b}</li>`).join("") + "</ul>" : "-";
                row.appendChild(cell); // add insurance cell to row
            });

            if (search && !row.innerHTML.toLowerCase().includes(search.toLowerCase())) return; // skip if search term not found

            tbody.appendChild(row); // append row to table body
        });
}

async function init() {
    const data = await loadData(); // load JSON data
    buildCategories(data); // populate category dropdown
    renderTable(data); // render initial table

    // event listener for category dropdown change
    document.getElementById("filter").addEventListener("change", e => {
        renderTable(data, e.target.value, document.getElementById("search").value); // re-render table with filter
    });

    // event listener for search input
    document.getElementById("search").addEventListener("input", e => {
        renderTable(data, document.getElementById("filter").value, e.target.value); // re-render table with search
    });
}

init(); // call init to start everything
