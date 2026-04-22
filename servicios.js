/* ============================
   CONFIGURACIÓN - SERVICIOS
============================ */
const csvUrl = "./SERVICIOS OBRA.csv"; 
const DELIM = ";";

const FECHA_COL = "FECHA ENTREGA ESPERADA";
const CLIENT_COL_NAME = "CLIENTE";
const PERIODO_COL_NAME = "Período de certificación";
const ESTADO_COL_NAME = "Estado Servicio";

let data = [];
let headers = [];

/* ============================
   HELPERS
============================ */
const clean = (v) => (v ?? "").toString().trim();
function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt ?? ""; }
function fmtInt(n) { return Number(n || 0).toLocaleString("es-AR"); }

function parseDateAny(s) {
    const t = clean(s);
    if (!t) return null;
    let m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    return null;
}

function getMonthKey(r) {
    const d = parseDateAny(r[FECHA_COL]);
    return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : null;
}

// Lector de CSV robusto (Soporta comillas y saltos de línea)
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

/* ============================
   LÓGICA PRINCIPAL
============================ */
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

    // Actualizamos solo el Total Seleccionado
    setText("kpiTotal", fmtInt(filtered.length));
}

/* ============================
   INIT
============================ */
window.addEventListener("DOMContentLoaded", () => {
    fetch(csvUrl)
    .then(r => {
        if (!r.ok) throw new Error("No se pudo cargar el CSV");
        return r.text();
    })
    .then(text => {
        const rows = parseCSV(text);
        if (rows.length < 2) return;

        headers = rows[0].map(clean);
        data = rows.slice(1).map(row => {
            let o = {};
            headers.forEach((h, i) => o[h] = clean(row[i]));
            return o;
        });

        const fill = (id, col) => {
            const values = [...new Set(data.map(r => r[col]).filter(Boolean))].sort();
            const sel = document.getElementById(id);
            if (!sel) return;
            sel.innerHTML = '<option value="__ALL__">Todos</option>';
            values.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v; opt.textContent = v;
                sel.appendChild(opt);
            });
        };

        fill("clienteSelect", CLIENT_COL_NAME);
        fill("clasif2Select", PERIODO_COL_NAME);
        fill("gcocSelect", ESTADO_COL_NAME);
        
        ["clienteSelect", "clasif2Select", "gcocSelect"].forEach(id => {
            document.getElementById(id)?.addEventListener("change", applyAll);
        });

        applyAll();
        // ESTA LÍNEA ES LA QUE QUITA EL LOADER
        document.getElementById("loader").style.display = "none";
    })
    .catch(err => {
        console.error(err);
        document.getElementById("loader").innerHTML = "Error cargando datos";
    });
});
