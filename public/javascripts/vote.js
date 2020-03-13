const queryString = window.location.search;

function send(preference) {
  window.location.replace("/prefer"+ queryString + "&preference=" + preference);
}
