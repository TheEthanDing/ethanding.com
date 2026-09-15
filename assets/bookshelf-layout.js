/* Shared, deterministic packing for the chronological bookcase. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BookshelfLayout = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function monthKey(book) {
    return /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(book.dateFinished || '') ? book.dateFinished.slice(0, 7) : '';
  }
  function periodKey(book) {
    const month = monthKey(book);
    return month ? `${month.slice(0, 4)}-Q${Math.ceil(Number(month.slice(5)) / 3)}` : 'undated';
  }
  function periodLabel(key) {
    if (key === 'undated') return 'Date not recorded';
    const [year, quarter] = key.split('-Q');
    const start = (Number(quarter) - 1) * 3;
    return `${months[start]}–${months[start + 2]} ${year}`;
  }
  function monthLabel(key) {
    return key ? `${months[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}` : 'Undated';
  }
  function bookSize(book, small = false, detail = false) {
    const ratio = clamp(book.appearance?.ratio || .66, .5, .85);
    const scale = detail ? 1 : small ? .62 : .72;
    const height = Math.round(clamp(142 / ratio, 188, 232) * scale);
    const depth = Math.round(clamp(21 + (book.meta?.pageCount || 300) * .045, 27, 65) * scale);
    return { height, depth, width: Math.round(height * ratio) };
  }
  function buildRows(books, { width, small = false, chronological = true } = {}) {
    const available = Math.max(100, width - (small ? 24 : 48));
    const rows = [];
    let row;
    function start(book) {
      const period = chronological ? periodKey(book) : '';
      row = { period, continuation: Boolean(period && rows.at(-1)?.period === period), items: [], used: 0 };
      rows.push(row);
    }
    for (const book of books) {
      if (!row || (chronological && row.period !== periodKey(book))) start(book);
      const size = bookSize(book, small);
      let marker = chronological && (!row.items.length || monthKey(row.items.at(-1).book) !== monthKey(book));
      // A face-out cover per row, only when there is room for it and its month tab.
      let featured = row.items.length === 3;
      const occupied = face => (face ? size.width * .94 + 8 : size.depth) + (marker && monthKey(book) ? 26 : 0) + (row.items.length ? 5 : 0);
      if (featured && row.used + occupied(true) > available) featured = false;
      if (row.items.length && row.used + occupied(featured) > available) {
        start(book);
        marker = chronological;
        featured = false;
      }
      row.used += occupied(featured);
      row.items.push({ book, featured, monthStart: marker ? monthKey(book) : '' });
    }
    return rows;
  }
  function paginateRows(rows, rowCount = 4) {
    const pages = [];
    for (let i = 0; i < rows.length; i += rowCount) pages.push(rows.slice(i, i + rowCount));
    return pages;
  }
  return { monthKey, periodKey, periodLabel, monthLabel, bookSize, buildRows, paginateRows };
});
