<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ABASTECIMIENTO - SERVICIOS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="base.css" />
  <link rel="stylesheet" href="cumplimiento.css" />
  <style>
    /* Estilo para la cajita del Total Seleccionado */
    .kpi-mini-box {
        background: #ffffff;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        padding: 10px;
        text-align: center;
        height: 90px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .kpi-mini-value {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        color: #3b82f6;
        line-height: 1;
    }
    .kpi-mini-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
        margin-top: 5px;
    }
    .filters-5 {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 15px;
        align-items: end;
    }
  </style>
</head>

<body class="page-cumplimiento">
  <div id="loader" class="loader-overlay">
    <div class="spinner-bars">
      <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
    </div>
    <div class="loading-text">Cargando servicios...</div>
  </div>

  <header class="topbar">
    <div class="topbar-left">
      <div class="title">ABASTECIMIENTO</div>
      <div class="subtitle">Análisis de Servicios y Subcontratos de Obra</div>
    </div>
    <div class="topbar-right">
      <div class="update-box">
        <div class="update-label">Última actualización</div>
        <div id="lastUpdate" class="update-date">22/04/2026</div> </div>
    </div>
  </header>

  <nav class="tabs">
    <a class="tab" href="analisis-mm.html">ANÁLISIS MM</a>
    <a class="tab" href="index.html">CUMPLIMIENTO</a>
    <a class="tab" href="demoras.html">DEMORAS</a>
    <a class="tab active" href="servicios.html">SERVICIOS</a>
    <a class="tab" href="ejemplo.html">📊 EJEMPLO</a>
  </nav>

  <main class="container">
    <section class="panel">
      <div class="panel-title">FILTROS DE SERVICIOS</div>
      <div class="panel-body filters-5">
        
        <div class="filter">
          <label>CLIENTE</label>
          <select id="clienteSelect" multiple size="6" class="multi-select">
            <option value="__ALL__">Todos</option>
          </select>
        </div>

        <div class="filter">
          <label>PERÍODO DE CERTIFICACIÓN</label>
          <select id="clasif2Select" multiple size="6" class="multi-select">
            <option value="__ALL__">Todos</option>
          </select>
        </div>

        <div class="filter">
          <label>ESTADO SERVICIO</label>
          <select id="gcocSelect" multiple size="6" class="multi-select">
            <option value="__ALL__">Todos</option>
          </select>
        </div>

        <div class="filter">
          <label>TOTAL SELECCIONADO</label>
          <div class="kpi-mini-box">
             <span id="kpiTotal" class="kpi-mini-value">0</span>
             <span class="kpi-mini-label">Servicios</span>
          </div>
        </div>

        <div class="filter">
          <label>&nbsp;</label>
          <button id="btnDownloadNO" class="btn">⬇ Descargar Selección</button>
        </div>
      </div>
    </section>
  </main>

  <script src="help.js"></script>
  <script src="servicios.js?v=4"></script>
</body>
</html>
