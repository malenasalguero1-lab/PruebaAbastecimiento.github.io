const csvUrl = "./SERVICIOS OBRA.csv"; 
const DELIM = ";";

const CLIENT_COL_NAME = "CLIENTE";
const PERIODO_COL_NAME = "Período de certificación";
const ESTADO_COL_NAME = "Estado Servicio";
const ESTADO_CERT_COL = "Estado Certificación";

let data = [];
let headers = [];

const clean = (v) => (v ?? "").toString().trim();
function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt ?? ""; }
function fmtInt(n) { return Number(n || 0).toLocaleString("es-AR"); }

function parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === DELIM && !inQuotes) { row.push(cur); cur = ""; }
        else if (ch === "\n" && !inQuotes) { row.push(cur); rows.push(row); row = []; cur = ""; }
        else cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
}

function getSelValues(id) {
    const sel = document.getElementById(id);
    if (!sel) return [];
    return [...sel.selectedOptions].map(o => o.value).filter(v => v !== "__ALL__");
}

function syncScrolls() {
    const top = document.getElementById('scroll-top');
    const bottom = document.getElementById('scroll-bottom');
    const content = document.getElementById('scroll-top-content');
    const table = document.getElementById('tablaServicios');

    if (top && bottom && content && table) {
        content.style.width = table.offsetWidth + 'px';
        top.onscroll = () => { bottom.scrollLeft = top.scrollLeft; };
        bottom.onscroll = () => { top.scrollLeft = bottom.scrollLeft; };
    }
}

function applyAll() {
    const selClientes = getSelValues("clienteSelect");
    const selPeriodos = getSelValues("clasif2Select");
    const selEstados = getSelValues("gcocSelect");

    const filtered = data.filter(r => {
        const matchClie = !selClientes.length || selClientes.includes(r[CLIENT_COL_NAME]);
        const matchPeri = !selPeriodos.length || selPeriodos.includes(r[PERIODO_COL_NAME]);
        const matchEsta = !selEstados.length || selEstados.includes(r[ESTADO_COL_NAME]);
        return matchClie && matchPeri && matchEsta;
    });

    setText("kpiTotal", fmtInt(filtered.length));

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    filtered.forEach(r => {
        const tr = document.createElement("tr");
        const estCert = clean(r[ESTADO_CERT_COL]).toLowerCase();
        if (estCert === "verde") tr.classList.add("row-verde");
        else if (estCert === "rojo") tr.classList.add("row-rojo");

        // MAPEO CORREGIDO SEGÚN ÚLTIMA CAPTURA
        tr.innerHTML = `
            <td>${r["CLIENTE"] || ""}</td>
            <td>${r["NRO. VA01/VA21"] || ""}</td>
            <td>${r["POS VA01/V A21"] || ""}</td>
            <td>${r["CODIGO ITEM"] || ""}</td>
            <td>${r["DESCRIPCION ITEM"] || ""}</td>
            <td>${r["CANTIDAD SOLICITADA"] || ""}</td>
            <td>${r["CANTIDAD TOTAL RECEPCIONAD"] || ""}</td>
            <td>${r["CANTIDAD PENDIENTE DE ADJUDICAR"] || ""}</td>
            <td>${r["CANTIDAD TOTAL PENDIENTE RECEP."] || ""}</td>
            <td>${r["NRO. RECEPCION"] || ""}</td>
            <td>${r["FECHA RECEPCION"] || ""}</td>
            <td>${r["ESTADO ITEM"] || ""}</td>
            <td>${r["FECHA ENTREGA ESPERADA"] || ""}</td>
            <td>${r["NRO. OC"] || ""}</td>
            <td>${r["GRUPO DE COMPRA OC"] || ""}</td>
            <td>${r["Estado Servicio"] || ""}</td>
        `;
        tbody.appendChild(tr);
    });
    setTimeout(syncScrolls, 100);
}

window.addEventListener("DOMContentLoaded", () => {
    fetch(csvUrl)
    .then(r => { if (!r.ok) throw new Error("Error CSV"); return r.text(); })
    .then(text => {
        const rows = parseCSV(text);
        if (rows.length < 2) return;
        headers = rows[0].map(clean);
        data = rows.slice(1).map(row => {
            let o = {};
            headers.forEach((h, i) => o[h] = clean(row[i]));
            return o;
        });
        fill("clienteSelect", CLIENT_COL_NAME);
        fill("clasif2Select", PERIODO_COL_NAME);
        fill("gcocSelect", ESTADO_COL_NAME);
        ["clienteSelect", "clasif2Select", "gcocSelect"].forEach(id => {
            document.getElementById(id)?.addEventListener("change", applyAll);
        });
        applyAll();
        document.getElementById("loader").style.display = "none";
        window.onresize = syncScrolls;
    });
});

function fill(id, col) {
    const values = [...new Set(data.map(r => r[col]).filter(Boolean))].sort();
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="__ALL__">Todos</option>';
    values.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v; opt.textContent = v;
        sel.appendChild(opt);
    });
}
