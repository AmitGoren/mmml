onload = function() {
  var upload = document.getElementById('upload');
  var label = document.getElementById('upload_label');
  var submit_group = document.getElementById('submit_group');

  upload.addEventListener('change', (e) => {
    upload_label.innerHTML = e.target.value.split( '\\' ).pop();
    submit_group.style.display = 'inline-block';
  });
}
