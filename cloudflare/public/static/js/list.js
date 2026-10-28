(function () {
  var rows = Array.prototype.slice.call(document.querySelectorAll('#rows tr'));
  var search = document.getElementById('search');
  var count = document.getElementById('count');
  var noMatch = document.getElementById('noMatch');

  function filter() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (r) {
      var hit = r.dataset.search.indexOf(q) !== -1;
      r.hidden = !hit;
      if (hit) shown++;
    });
    count.textContent = rows.length ? shown + ' of ' + rows.length : '';
    if (noMatch) noMatch.hidden = shown !== 0;
  }
  if (search) { search.addEventListener('input', filter); filter(); }

  var dlg = document.getElementById('confirm');
  document.querySelectorAll('button[data-id]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.getElementById('confirmText').textContent =
        b.dataset.name + ' will be permanently removed. This can’t be undone.';
      document.getElementById('deleteForm').action = '/employees/' + b.dataset.id + '/delete';
      dlg.showModal();
    });
  });
  var cancel = document.getElementById('cancel');
  if (cancel) cancel.addEventListener('click', function () { dlg.close(); });
})();
