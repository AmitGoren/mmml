const queryString = window.location.search;

function vote(preference) {
  window.location.replace("/prefer"+ queryString + "&preference=" + preference);
}
