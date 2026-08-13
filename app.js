/* Shared config and Socrata query helpers for the HPD Violations Chart pages.
   Loaded by every page; each page keeps its own state — nothing here is
   written back to across page loads. */
(function (global) {
  'use strict';

  var APP_TOKEN = 'JGurc4mbAlizJjvfgIeKc6Th2';
  var BASE = 'https://data.cityofnewyork.us/resource/csn4-vhvf.json';
  var WINDOW_MONTHS = 12;

  var CLASS_ORDER = ['A', 'B', 'C'];

  var CLASS_COLOR = { A: '#4b7a53', B: '#c2790a', C: '#8a2a1d', I: '#9a978c' };

  var CLASS_LABEL = {
    A: 'Class A',
    B: 'Class B',
    C: 'Class C',
    I: 'Class I'
  };

  var CLASS_TAGLINE = {
    A: 'Non-hazardous',
    B: 'Hazardous',
    C: 'Immediately hazardous',
    I: 'Administrative order'
  };

  var CLASS_DESCRIPTION = {
    A: 'Paint, leaks, faulty fixtures.',
    B: 'No heat or hot water, pests, broken locks.',
    C: 'No gas, fire hazards, structural danger.',
    I: 'Not tied to an inspection. No severity rating, so it isn’t counted in the class breakdown.'
  };

  var BOROUGH_DISPLAY = {
    MANHATTAN: 'Manhattan',
    BRONX: 'Bronx',
    BROOKLYN: 'Brooklyn',
    QUEENS: 'Queens',
    'STATEN ISLAND': 'Staten Island'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/'/g, "''");
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function titleCase(s) {
    return String(s || '').toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function boroughDisplay(b) {
    return BOROUGH_DISPLAY[String(b || '').toUpperCase()] || titleCase(b || '');
  }

  function addressLabel(row) {
    return (row.housenumber || '') + ' ' + titleCase(row.streetname || '');
  }

  function buildKey(row) {
    return row.buildingid || [row.housenumber, row.streetname, row.boro].join('|');
  }

  function buildWhere(row) {
    if (row.buildingid) return "buildingid='" + esc(row.buildingid) + "'";
    return "housenumber='" + esc(row.housenumber) + "' AND upper(streetname)='" + esc((row.streetname || '').toUpperCase()) + "' AND boro='" + esc(row.boro) + "'";
  }

  function sodaUrl(params) {
    return BASE + '?' + new URLSearchParams(Object.assign({ '$$app_token': APP_TOKEN }, params)).toString();
  }

  function cutoffISO(months) {
    var d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 10);
  }

  function monthsRange(n) {
    var arr = [];
    var base = new Date();
    base.setDate(1);
    for (var i = n - 1; i >= 0; i--) {
      var dt = new Date(base.getFullYear(), base.getMonth() - i, 1);
      arr.push({ key: dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'), label: dt.toLocaleString('en-US', { month: 'short' }) });
    }
    return arr;
  }

  function fetchSoda(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('NYC Open Data request failed (' + res.status + ')');
      return res.json();
    });
  }

  // Class-count rows -> stacked breakdown bar segments (A, B, C in order, plus
  // any other class present) and a total.
  function buildClassBar(classData) {
    var counts = {};
    var total = 0;
    (classData || []).forEach(function (r) {
      var n = parseInt(r.cnt, 10) || 0;
      counts[r.class] = (counts[r.class] || 0) + n;
      total += n;
    });
    var keys = CLASS_ORDER.filter(function (c) { return counts[c]; })
      .concat(Object.keys(counts).filter(function (c) { return CLASS_ORDER.indexOf(c) === -1; }));
    var segments = keys.map(function (c) {
      return {
        cls: c,
        count: counts[c],
        pct: total ? (counts[c] / total * 100).toFixed(1) + '%' : '0%',
        color: CLASS_COLOR[c] || '#9a978c',
        label: CLASS_LABEL[c] || ('Class ' + c)
      };
    });
    return { segments: segments, total: total, counts: counts };
  }

  // month/class-count rows -> one entry per month in the window, each with
  // stacked segments sized relative to that month's own total, and a
  // barHeightPct scaled relative to the window's busiest month.
  function buildStackedTrend(trendData, months) {
    var range = monthsRange(months);
    var byMonth = {};
    (trendData || []).forEach(function (r) {
      var key = String(r.month).slice(0, 7);
      byMonth[key] = byMonth[key] || {};
      byMonth[key][r.class] = (byMonth[key][r.class] || 0) + (parseInt(r.cnt, 10) || 0);
    });
    var withTotals = range.map(function (m) {
      var counts = byMonth[m.key] || {};
      var total = Object.keys(counts).reduce(function (s, c) { return s + counts[c]; }, 0);
      return { key: m.key, label: m.label, counts: counts, total: total };
    });
    var maxTotal = Math.max.apply(null, [1].concat(withTotals.map(function (m) { return m.total; })));
    return withTotals.map(function (m) {
      var keys = CLASS_ORDER.filter(function (c) { return m.counts[c]; })
        .concat(Object.keys(m.counts).filter(function (c) { return CLASS_ORDER.indexOf(c) === -1; }));
      var segments = keys.map(function (c) {
        return {
          cls: c,
          count: m.counts[c],
          color: CLASS_COLOR[c] || '#9a978c',
          heightPct: m.total ? (m.counts[c] / m.total * 100).toFixed(1) + '%' : '0%'
        };
      });
      return {
        key: m.key,
        label: m.label,
        total: m.total,
        segments: segments,
        barHeightPct: m.total ? Math.max(3, m.total / maxTotal * 100) : 0
      };
    });
  }

  function formatCount(n) {
    return (parseInt(n, 10) || 0).toLocaleString();
  }

  function renderBreakdownBar(segments, opts) {
    opts = opts || {};
    var cls = 'breakdown-bar' + (opts.large ? ' breakdown-bar-large' : '');
    if (!segments.length) return '<div class="' + cls + '"></div>';
    return '<div class="' + cls + '">' + segments.map(function (seg) {
      return '<div style="width:' + seg.pct + ';background:' + seg.color + ';" title="' + escapeHtml(seg.label) + ': ' + formatCount(seg.count) + '"></div>';
    }).join('') + '</div>';
  }

  function renderBreakdownLegend(segments) {
    return '<div class="breakdown-legend">' + segments.map(function (seg) {
      return '<div><span class="legend-dot" style="background:' + seg.color + ';"></span>' + escapeHtml(seg.label) + ' &middot; ' + formatCount(seg.count) + '</div>';
    }).join('') + '</div>';
  }

  function renderTrendChart(trendMonths) {
    var CHART_H = 160;
    return '<div class="trend-chart">' + trendMonths.map(function (m) {
      var barH = Math.round(m.barHeightPct / 100 * CHART_H);
      var segsHtml = m.segments.length
        ? m.segments.map(function (seg) {
            return '<div class="trend-seg" style="height:' + seg.heightPct + ';background:' + seg.color + ';" title="' + escapeHtml(m.label) + ' &middot; Class ' + seg.cls + ': ' + formatCount(seg.count) + '"></div>';
          }).join('')
        : '';
      return '<div class="trend-col" title="' + escapeHtml(m.label) + ': ' + formatCount(m.total) + '">' +
        '<div class="trend-bar" style="height:' + barH + 'px;">' + segsHtml + '</div>' +
        '<div class="trend-label">' + escapeHtml(m.label) + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  global.HPD = {
    APP_TOKEN: APP_TOKEN,
    BASE: BASE,
    WINDOW_MONTHS: WINDOW_MONTHS,
    CLASS_ORDER: CLASS_ORDER,
    CLASS_COLOR: CLASS_COLOR,
    CLASS_LABEL: CLASS_LABEL,
    CLASS_TAGLINE: CLASS_TAGLINE,
    CLASS_DESCRIPTION: CLASS_DESCRIPTION,
    BOROUGH_DISPLAY: BOROUGH_DISPLAY,
    esc: esc,
    escapeHtml: escapeHtml,
    titleCase: titleCase,
    boroughDisplay: boroughDisplay,
    addressLabel: addressLabel,
    buildKey: buildKey,
    buildWhere: buildWhere,
    sodaUrl: sodaUrl,
    cutoffISO: cutoffISO,
    monthsRange: monthsRange,
    fetchSoda: fetchSoda,
    buildClassBar: buildClassBar,
    buildStackedTrend: buildStackedTrend,
    formatCount: formatCount,
    renderBreakdownBar: renderBreakdownBar,
    renderBreakdownLegend: renderBreakdownLegend,
    renderTrendChart: renderTrendChart
  };
})(window);
