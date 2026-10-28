document.querySelectorAll('button[data-confirm]').forEach(function (b) {
  b.addEventListener('click', function (e) {
    if (!window.confirm(b.dataset.confirm)) e.preventDefault();
  });
});
