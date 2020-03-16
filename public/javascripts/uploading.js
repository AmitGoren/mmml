onload = function() {
  var upload = document.getElementById('upload');
  var upload_label = document.getElementById('upload_label');
  var message = document.getElementById('message');
  var submit_group = document.getElementById('submit_group');

  upload.addEventListener('change', (e) => {
    message.innerHTML = e.target.value.split( '\\' ).pop();
    submit_group.style.display = 'inline-block';
    upload_label.style.display = 'none';
  });
}
