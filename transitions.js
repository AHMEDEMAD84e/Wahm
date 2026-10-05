
(function () {
  // Clear any residual transition classes on page load
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('leaving');
  });
})();
